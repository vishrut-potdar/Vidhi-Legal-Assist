// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GeminiChatbot } from '../../src/components/GeminiChatbot';
import { UploadModal } from '../../src/components/UploadModal';
import { PreferencesProvider } from '../../src/context/PreferencesContext';
import { exportReportAsText, generateReportText } from '../../src/utils/exportReport';
import { initialDocumentInfo, initialFindings, missingDocumentsList } from '../../src/data/mockData';

const ndjson = (events: object[]) => new Response(events.map((e) => JSON.stringify(e)).join('\n') + '\n', { status: 200 });

describe('GeminiChatbot', () => {
  const renderChat = (props: Partial<React.ComponentProps<typeof GeminiChatbot>> = {}) => {
    const onClose = vi.fn();
    render(
      <PreferencesProvider>
        <GeminiChatbot isOpen onClose={onClose} language="EN" {...props} />
      </PreferencesProvider>
    );
    return { onClose };
  };

  it('streams the reply into the conversation log and shows the model note', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      ndjson([
        { type: 'delta', text: 'An EC lists ' },
        { type: 'delta', text: 'registered charges.' },
        { type: 'done', modelUsed: 'gemini-3.1-flash-lite', offline: false, notice: 'gemini-3.8-flash was unavailable, so gemini-3.1-flash-lite answered instead.' },
      ])
    );
    renderChat({ documentContext: 'Deed context', documentTitle: 'Sale Deed — Flat 12' });

    expect(screen.getByText('Active document: Sale Deed — Flat 12')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Your question'), 'What is an EC?{enter}');

    const log = screen.getByRole('log', { name: 'Conversation' });
    await waitFor(() => expect(log).toHaveTextContent('An EC lists registered charges.'));
    expect(screen.getByRole('note')).toHaveTextContent(/answered instead/);

    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toMatchObject({ documentContext: 'Deed context', language: 'EN', modelRole: 'general', readingLevel: 'standard' });
    expect(body.messages.at(-1)).toEqual({ role: 'user', content: 'What is an EC?' });
  });

  it('offers only models the key supports (no Pro option)', () => {
    renderChat();
    const options = Array.from(screen.getByLabelText('AI model').querySelectorAll('option')).map((o) => o.textContent);
    expect(options.join(' ')).not.toMatch(/Pro/);
  });

  it('shows a friendly error when the server rate-limits', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Rate limit for AI questions exceeded.' }), { status: 429 }));
    renderChat();
    await userEvent.type(screen.getByLabelText('Your question'), 'hi{enter}');
    expect(await screen.findByText('Rate limit for AI questions exceeded.')).toBeInTheDocument();
  });

  it('says when no document is open and closes on Escape', async () => {
    const { onClose } = renderChat();
    expect(screen.getByText(/No document uploaded/)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});

describe('UploadModal', () => {
  it('analyses pasted text, shows progress, and returns the result', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      const encoder = new TextEncoder();
      const body = new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder.encode('{"type":"stage","stage":"analyzing","message":"Analysing clauses — part 1 of 1…","progress":50}\n'));
          await gate;
          controller.enqueue(encoder.encode('{"type":"result","payload":{"id":"doc-9"}}\n'));
          controller.close();
        },
      });
      return new Response(body, { status: 200 });
    });
    const onUploadSuccess = vi.fn();
    const onClose = vi.fn();
    render(
      <PreferencesProvider>
        <UploadModal isOpen onClose={onClose} language="EN" onUploadSuccess={onUploadSuccess} />
      </PreferencesProvider>
    );

    expect(screen.getByRole('dialog', { name: 'Analyze a Legal Document' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /Paste Contract Text/ }));
    fireEvent.change(screen.getByLabelText('Paste contract text'), { target: { value: '1. A clause.' } });
    await userEvent.click(screen.getByRole('button', { name: /Analyze Text with Vidhi AI/ }));

    expect(await screen.findByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    release();
    await waitFor(() => expect(onUploadSuccess).toHaveBeenCalledWith({ id: 'doc-9' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows an alert when the file is too large for the server', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Request Entity Too Large', { status: 413 }));
    render(
      <PreferencesProvider>
        <UploadModal isOpen onClose={() => {}} language="EN" onUploadSuccess={() => {}} />
      </PreferencesProvider>
    );
    await userEvent.click(screen.getByRole('tab', { name: /Paste Contract Text/ }));
    fireEvent.change(screen.getByLabelText('Paste contract text'), { target: { value: 'x' } });
    await userEvent.click(screen.getByRole('button', { name: /Analyze Text with Vidhi AI/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/too large to upload/);
  });
});

describe('report export', () => {
  it('includes the matter details and advocate questions', () => {
    const text = generateReportText(initialDocumentInfo, initialFindings, missingDocumentsList);
    expect(text).toContain(initialDocumentInfo.title);
    const inBrief = initialFindings.find((f) => f.inAdvocateBrief)!;
    expect(text).toContain(inBrief.advocateQuestion);
  });

  it('downloads a .txt file named after the document', () => {
    const createUrl = vi.fn(() => 'blob:report');
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: revoke });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    exportReportAsText({ ...initialDocumentInfo, title: 'Sale Deed 12' }, initialFindings, missingDocumentsList);

    expect(createUrl).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect((clickSpy.mock.contexts[0] as HTMLAnchorElement).download).toBe('Vidhi-Report-sale-deed-12.txt');
    expect(revoke).toHaveBeenCalledWith('blob:report');
  });
});
