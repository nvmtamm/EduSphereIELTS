import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './Router'
import { Providers } from './providers'

export const App: React.FC = () => {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}

export default App
