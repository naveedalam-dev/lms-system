import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/login/page'

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

jest.mock('@/app/login/actions', () => ({
  login: jest.fn(),
}))

describe('LoginPage', () => {
  it('renders the login form elements', async () => {
    const resolvedSearchParams = Promise.resolve({})
    const Component = await LoginPage({ searchParams: resolvedSearchParams })
    
    render(Component)

    const heading = screen.getByText(/lms portal/i)
    expect(heading).toBeInTheDocument()
    
    const emailInput = screen.getByLabelText(/email address/i)
    expect(emailInput).toBeInTheDocument()

    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toBeInTheDocument()

    const button = screen.getByRole('button', { name: /sign in/i })
    expect(button).toBeInTheDocument()
  })

  it('renders an error message when error searchParam is present', async () => {
    const resolvedSearchParams = Promise.resolve({ error: 'Invalid login credentials' })
    const Component = await LoginPage({ searchParams: resolvedSearchParams })
    
    render(Component)

    const errorMessage = screen.getByText(/invalid login credentials/i)
    expect(errorMessage).toBeInTheDocument()
  })
})
