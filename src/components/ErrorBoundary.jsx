import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="px-5 pb-52 pt-28">
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-center">
            <p className="font-medium text-gray-900">Something went wrong</p>
            <p className="mt-1 text-sm text-gray-500">Please try again.</p>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
