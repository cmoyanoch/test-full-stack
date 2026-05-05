import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ListPaginationFooter } from './ListPaginationFooter';

describe('ListPaginationFooter', () => {
  it('shows range and notifies with 0-based page index on page button click', () => {
    const onPageChange = vi.fn();

    render(
      <ListPaginationFooter
        count={30}
        pageSize={10}
        page={0}
        onPageChange={onPageChange}
        ariaLabel="Test pagination"
        hideWhenSinglePage={false}
      />,
    );

    expect(screen.getByText('Mostrando 1–10 de 30')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ir a la página 2' }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('returns null when hideWhenSinglePage and count fits one page', () => {
    const { container } = render(
      <ListPaginationFooter
        count={4}
        pageSize={4}
        page={0}
        onPageChange={vi.fn()}
        ariaLabel="Test"
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
