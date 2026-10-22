import { Request, Response } from "express"

export function logoutController() {
  return (_: Request, res: Response) => {
    res.clearCookie("accessToken")
    res.status(200).json({ message: "Logged out successfully" })
  }
}
