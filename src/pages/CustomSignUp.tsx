import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { Music, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const CustomSignUp = () => {
    const { isLoaded, signUp, setActive } = useSignUp();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Handle submission of the initial form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoaded) return;

        // Custom Validation
        if (!firstName.trim()) {
            toast.error("First name is required");
            return;
        }

        setIsLoading(true);

        try {
            await signUp.create({
                firstName,
                lastName,
                emailAddress: email,
                password,
            });

            // Send the email verification code
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

            setPendingVerification(true);
            toast.success("Account created! Please check your email for the verification code.");
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            toast.error(err.errors?.[0]?.message || "Something went wrong during sign up");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (!isLoaded) return;
        try {
            await signUp.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/dashboard",
            });
        } catch (err: any) {
            console.error("OAuth error:", err);
            toast.error(err.errors?.[0]?.message || "Failed to sign in with Google");
        }
    };

    // Handle submission of the verification form
    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setIsLoading(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status !== "complete") {
                console.log(JSON.stringify(completeSignUp, null, 2));
            }

            if (completeSignUp.status === "complete") {
                await setActive({ session: completeSignUp.createdSessionId });
                toast.success("Welcome to ChordAI!");
                navigate("/dashboard");
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            toast.error(err.errors?.[0]?.message || "Invalid verification code");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen hero-mesh flex items-center justify-center p-4 relative overflow-hidden bg-[#0d0d12] text-white">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/15 blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/15 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-primary/5 to-accent/5 blur-3xl" />
            </div>

            {/* Back to Home */}
            <Link
                to="/"
                className="absolute top-6 left-6 flex items-center space-x-2 text-muted-foreground hover:text-white transition-colors group z-20"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to home</span>
            </Link>

            <div className="w-full max-w-[420px] relative z-10 animate-fade-in-scale">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center space-x-3 mb-6 group">
                        <div className="relative">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/20">
                                <Music className="h-7 w-7 text-primary" />
                            </div>
                            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent animate-pulse" />
                        </div>
                        <span className="font-sora font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            ChordAI
                        </span>
                    </Link>

                    <h1 className="font-sora font-bold text-3xl mb-3 text-white">
                        {pendingVerification ? "Verify Email" : "Create Account"}
                    </h1>
                    <p className="text-gray-400">
                        {pendingVerification
                            ? `We sent a code to ${email}`
                            : "Start transforming music into chords with AI"
                        }
                    </p>
                </div>

                <div className="bg-[#1a1a23]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl">
                    {!pendingVerification ? (
                        <div className="space-y-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full bg-white text-gray-900 hover:bg-gray-100 border-0 flex items-center justify-center gap-2"
                                onClick={handleGoogleSignIn}
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#1a1a23] px-2 text-gray-400">Or continue with email</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-gray-300">First Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="John"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Doe"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        required
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Up"}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-gray-300">Verification Code</Label>
                                <Input
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="Enter code"
                                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 text-center text-2xl tracking-widest"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code"}
                            </Button>
                        </form>
                    )}

                    {!pendingVerification && (
                        <div className="mt-6 text-center">
                            <p className="text-gray-400 text-sm">
                                Already have an account?{" "}
                                <Link to="/login" className="text-primary hover:text-accent font-semibold transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomSignUp;
