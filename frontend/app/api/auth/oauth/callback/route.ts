import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Forward the request to the backend OAuth2 endpoint
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8081/api/v1';
    
    const response = await fetch(`${backendUrl}/auth/oauth2/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { success: false, message: errorData.message || 'OAuth authentication failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Store the JWT token in a cookie
    if (data.success && data.data?.accessToken) {
      const response = NextResponse.json(data);
      
      // Set the session cookie
      response.cookies.set('deligh_session', data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      // Set the role cookie
      if (data.data.roles && data.data.roles.length > 0) {
        response.cookies.set('deligh_role', data.data.roles[0], {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        });
      }

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid response from authentication server' },
      { status: 500 }
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}