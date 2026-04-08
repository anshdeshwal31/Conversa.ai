import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { userId } = await auth()

    if (!userId) {
        return NextResponse.redirect(new URL('/sign-in', process.env.NEXT_PUBLIC_APP_URL))
    }

    const apiKey = process.env.TRELLO_API_KEY
    const requestOrigin = new URL(request.url).origin
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || requestOrigin
    const returnUrl = process.env.TRELLO_RETURN_URL || `${appUrl}/integrations/trello/callback`

    if (!apiKey) {
        return NextResponse.redirect(new URL('/integrations?error=trello_key_missing', appUrl))
    }

    const authUrl = `https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&key=${apiKey}&return_url=${encodeURIComponent(returnUrl)}`

    return NextResponse.redirect(authUrl)
}