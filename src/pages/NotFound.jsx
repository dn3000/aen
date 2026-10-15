import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100svh-56px)] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl font-bold text-green-primary/20 mb-2">404</div>
      <img src="/icons/aen-logohandsbrwn.svg" alt="AEN" className="h-8 w-8 object-contain mb-4" />
      <h1 className="text-2xl font-bold text-green-primary mb-2">Page Not Found</h1>
      <p className="text-gray-500 text-sm mb-8 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  )
}
