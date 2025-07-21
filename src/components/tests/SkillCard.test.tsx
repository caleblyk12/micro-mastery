// src/components/tests/SkillCard.test.tsx
import { render, screen } from '@testing-library/react';
import SkillCard from '../SkillCard';

describe('SkillCard component', () => {
  it('renders title, category and formatted date correctly', () => {
    const props = {
      title: 'Learn React',
      category: 'Programming',
      date: '2023-07-21T00:00:00Z', // ISO date string
    };

    render(<SkillCard {...props} />);

    // Check category text
    expect(screen.getByText(/Category:/i)).toHaveTextContent(`Category: ${props.category}`);

    // Check title text
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(props.title);

    // Check formatted date text (locale date string)
    const formattedDate = new Date(props.date).toLocaleDateString();
    expect(screen.getByText(new RegExp(formattedDate))).toBeInTheDocument();
  });
});