"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  membershipTier: "standard" | "premium" | "elite"
  joinDate: string
  preferences: {
    newsletter: boolean
    smsUpdates: boolean
    currency: string
    language: string
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "SET_LOADING"; payload: boolean }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true }

    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      }

    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }

    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }

    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      }

    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    default:
      return state
  }
}

const AuthContext = createContext<{
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>
  logout: () => void
  socialLogin: (provider: "google" | "apple" | "facebook") => Promise<boolean>
} | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem("walnut-store-user")
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser)
          dispatch({ type: "LOGIN_SUCCESS", payload: user })
        } catch (error) {
          console.error("Failed to parse saved user:", error)
          localStorage.removeItem("walnut-store-user")
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

      // Mock user data
      const user: User = {
        id: "1",
        email,
        firstName: "John",
        lastName: "Doe",
        avatar: "/placeholder.svg?height=100&width=100&text=JD",
        membershipTier: "premium",
        joinDate: "2024-01-15",
        preferences: {
          newsletter: true,
          smsUpdates: false,
          currency: "USD",
          language: "en",
        },
      }

      localStorage.setItem("walnut-store-user", JSON.stringify(user))
      dispatch({ type: "LOGIN_SUCCESS", payload: user })
      return true
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" })
      return false
    }
  }

  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" })

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        firstName,
        lastName,
        membershipTier: "standard",
        joinDate: new Date().toISOString().split("T")[0],
        preferences: {
          newsletter: true,
          smsUpdates: false,
          currency: "USD",
          language: "en",
        },
      }

      localStorage.setItem("walnut-store-user", JSON.stringify(user))
      dispatch({ type: "LOGIN_SUCCESS", payload: user })
      return true
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" })
      return false
    }
  }

  const socialLogin = async (provider: "google" | "apple" | "facebook"): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" })

    try {
      // Simulate social login
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: `user@${provider}.com`,
        firstName: "Social",
        lastName: "User",
        avatar: `/placeholder.svg?height=100&width=100&text=${provider.charAt(0).toUpperCase()}`,
        membershipTier: "standard",
        joinDate: new Date().toISOString().split("T")[0],
        preferences: {
          newsletter: true,
          smsUpdates: false,
          currency: "USD",
          language: "en",
        },
      }

      localStorage.setItem("walnut-store-user", JSON.stringify(user))
      dispatch({ type: "LOGIN_SUCCESS", payload: user })
      return true
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" })
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("walnut-store-user")
    dispatch({ type: "LOGOUT" })
  }

  return (
    <AuthContext.Provider value={{ state, dispatch, login, register, logout, socialLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
