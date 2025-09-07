import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import LoadingSpinner from "./LoadingSpinner"

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute