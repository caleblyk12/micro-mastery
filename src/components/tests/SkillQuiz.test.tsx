import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SkillQuiz from '../SkillQuiz'


// 🔧 MOCK supabase
jest.mock('../../helpers/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: [
            {
              id: 1,
              question: 'What is 2 + 2?',
              correct_answer: '4',
              wrong_answer_1: '3',
              wrong_answer_2: '5',
              wrong_answer_3: '22',
            },
          ],
        })),
      })),
    })),
  },
}))

describe('SkillQuiz component', () => {
  it('renders quiz and handles correct answer submission', async () => {
    const mockOnComplete = jest.fn()

    render(<SkillQuiz skillId={1} onComplete={mockOnComplete} />)

    // Wait for the question to appear
    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
    })

    // Click the correct answer
    fireEvent.click(screen.getByLabelText('4'))

    // Click the submit button
    fireEvent.click(screen.getByText('Submit Quiz'))

    // Wait for the feedback to show
    await waitFor(() => {
      expect(screen.getByText('✅ Correct')).toBeInTheDocument()
    })

    // Ensure onComplete is called with the correct count and result
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(1, expect.any(Array))
    })
  })
})