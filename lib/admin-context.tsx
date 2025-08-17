"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin" | "super_admin"
  permissions: string[]
}

interface AdminState {
  admin: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

type AdminAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: AdminUser }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }

const initialState: AdminState = {
  admin: null,
  isAuthenticated: false,
  isLoading: true,
}

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true }

    case "LOGIN_SUCCESS":
      return {
        ...state,
        admin: action.payload,
        isAuthenticated: true,
        isLoading: false,
      }

    case "LOGIN_FAILURE":
      return {
        ...state,
        admin: null,
        isAuthenticated: false,
        isLoading: false,
      }

    case "LOGOUT":
      return {
        ...state,
        admin: null,
        isAuthenticated: false,
        isLoading: false,
      }

    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    default:
      return state
  }
}

const AdminContext = createContext<{
  state: AdminState
  dispatch: React.Dispatch<AdminAction>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
} | null>(null)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState)

  // Check for existing admin session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedAdmin = localStorage.getItem("walnut-store-admin")
      if (savedAdmin) {
        try {
          const admin = JSON.parse(savedAdmin)
          dispatch({ type: "LOGIN_SUCCESS", payload: admin })
        } catch (error) {
          console.error("Failed to parse saved admin:", error)
          localStorage.removeItem("walnut-store-admin")
        }
      }
      dispatch({ type: "SET_LOADING", payload: false })
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" })

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock admin data
      const admin: AdminUser = {
        id: "admin-1",
        email,
        name: "Admin User",
        role: "super_admin",
        permissions: ["products", "orders", "users", "analytics", "settings"],
      }

      localStorage.setItem("walnut-store-admin", JSON.stringify(admin))
      dispatch({ type: "LOGIN_SUCCESS", payload: admin })
      return true
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" })
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("walnut-store-admin")
    dispatch({ type: "LOGOUT" })
  }

  return <AdminContext.Provider value={{ state, dispatch, login, logout }}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
