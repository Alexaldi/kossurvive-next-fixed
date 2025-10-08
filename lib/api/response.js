import { NextResponse } from "next/server"

export const successResponse = (message, data = null, status = 200) =>
    NextResponse.json({ status: "success", message, data }, { status })

export const errorResponse = (message, status = 500, data = null) =>
    NextResponse.json({ status: "error", message, data }, { status })
