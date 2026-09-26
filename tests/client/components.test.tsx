// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AnalysisProgress } from '../../src/components/AnalysisProgress';
import { BilingualText } from '../../src/components/BilingualText';
import { LoginScreen } from '../../src/components/LoginScreen';
import { ReadingLevelToggle } from '../../src/components/ReadingLevelToggle';
import { PreferencesProvider } from '../../src/context/PreferencesContext';
import { activateOnKey } from '../../src/utils/a11y';

describe('ReadingLevelToggle', () => {
  it('exposes a radio group, switches level and remembers the choice', async () => {
    render(
      <PreferencesProvider>
        <ReadingLevelToggle />
      </PreferencesProvider>
    );
    expect(screen.getByRole('radiogroup', { name: /reading level/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Standard/ })).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(screen.getByRole('radio', { name: /Detailed/ }));
    expect(screen.getByRole('radio', { name: /Detailed/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /Standard/ })).toHaveAttribute('aria-checked', 'false');
    expect(localStorage.getItem('vidhi_reading_level')).toBe('detailed');
  });

  it('shows full Hindi labels even in compact mode (no broken syllables)', () => {
    render(
      <PreferencesProvider>
        <ReadingLevelToggle language="HI" compact />
      </PreferencesProvider>
    );
    expect(screen.getByText('विस्तृत')).toBeInTheDocument();
  });
});

describe('BilingualText', () => {
  it('shows Hindi with the English original underneath, each with its lang attribute', () => {
    render(<BilingualText language="HI" en="Pay after loan closure." hi="लोन बंद होने के बाद भुगतान करें।" />);
    expect(screen.getByText('लोन बंद होने के बाद भुगतान करें।')).toHaveAttribute('lang', 'hi');
    expect(screen.getByText('Pay after loan closure.')).toHaveAttribute('lang', 'en');
  });

  it('shows only English when no translation exists or English is selected', () => {
    const { rerender } = render(<BilingualText language="HI" en="Only English" />);
    expect(screen.getByText('Only English').tagName).toBe('P');
    rerender(<BilingualText language="EN" en="English" hi="हिंदी" />);
    expect(screen.queryByText('हिंदी')).not.toBeInTheDocument();
  });
});

describe('AnalysisProgress', () => {
  it('announces progress and step states to assistive technology', () => {
    render(
      <AnalysisProgress
        stage="analyzing"
        message="Analysing clauses — part 1 of 2…"
        progress={40}
        partials={[{ clauseNumber: 4, title: 'Unreleased mortgage', riskLevel: 'HIGH' }]}
        onCancel={() => {}}
      />
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByRole('status')).toHaveTextContent('Analysing clauses — part 1 of 2…');
    expect(screen.getByText('Reading').textContent).toContain('(completed)');
    expect(screen.getByText('Analysing clauses').textContent).toContain('(in progress)');
    expect(screen.getByText('Flagging risks').textContent).toContain('(pending)');
    expect(screen.getByText(/Clause 4: Unreleased mortgage/)).toBeInTheDocument();
  });

  it('calls onCancel', async () => {
    const onCancel = vi.fn();
    render(<AnalysisProgress stage="parsing" message="" progress={5} partials={[]} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('LoginScreen', () => {
  const mockFetch = (status: number, body: object) =>
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

  it('has labelled fields and validates empty input without calling the server', async () => {
    const fetchSpy = mockFetch(200, {});
    render(<LoginScreen onSignedIn={() => {}} />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'username');
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/enter your email and password/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows the server error and clears the password on failure', async () => {
    mockFetch(401, { error: 'That email and password combination is not allowed.' });
    render(<LoginScreen onSignedIn={() => {}} />);
    await userEvent.type(screen.getByLabelText('Email'), 'x@y.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/not allowed/);
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });

  it('signs in and reports the email', async () => {
    const fetchSpy = mockFetch(200, { authenticated: true, email: 'vishrutedu@gmail.com' });
    const onSignedIn = vi.fn();
    render(<LoginScreen onSignedIn={onSignedIn} />);
    await userEvent.type(screen.getByLabelText('Email'), 'vishrutedu@gmail.com');
    await userEvent.type(screen.getByLabelText('Password'), 'anything{enter}');
    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith('vishrutedu@gmail.com'));
    expect(JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string)).toEqual({
      email: 'vishrutedu@gmail.com',
      password: 'anything',
    });
  });
});

describe('activateOnKey (keyboard support for clickable cards)', () => {
  it('triggers click on Enter and Space, but not for keys from nested controls', () => {
    const onClick = vi.fn();
    render(
      <div role="button" tabIndex={0} onClick={onClick} onKeyDown={activateOnKey} data-testid="card">
        Card <button type="button">inner</button>
      </div>
    );
    const card = screen.getByTestId('card');
    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });
    fireEvent.keyDown(card, { key: 'a' });
    expect(onClick).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(screen.getByText('inner'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
