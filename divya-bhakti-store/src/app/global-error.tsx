'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body>
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        backgroundColor: '#fafafa',
                        padding: '2rem',
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            fontSize: '4rem',
                            marginBottom: '1rem',
                        }}
                    >
                        🙏
                    </div>
                    <h1
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#1a1a1a',
                            marginBottom: '0.5rem',
                        }}
                    >
                        Something went wrong
                    </h1>
                    <p
                        style={{
                            fontSize: '1rem',
                            color: '#666',
                            marginBottom: '1.5rem',
                            maxWidth: '400px',
                        }}
                    >
                        We apologize for the inconvenience. Please try again.
                    </p>
                    {error?.digest && (
                        <p
                            style={{
                                fontSize: '0.75rem',
                                color: '#999',
                                marginBottom: '1rem',
                            }}
                        >
                            Error ID: {error.digest}
                        </p>
                    )}
                    <button
                        onClick={reset}
                        style={{
                            padding: '0.75rem 2rem',
                            backgroundColor: '#f97316',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </body>
        </html>
    );
}
