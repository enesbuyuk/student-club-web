import {getTranslations, setRequestLocale} from "next-intl/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import {cookies} from "next/headers";
import {getMetadata} from "@/lib/metadata";

const pageName = "admin";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return getMetadata(locale, pageName);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const {locale} = await params;
    setRequestLocale(locale);

    const [metadataTranslations, contentTranslations] = await Promise.all([
        getTranslations({locale, namespace:`metadata.${pageName}`}),
        getTranslations({locale, namespace:`pages.${pageName}`})
    ]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-6">
                <Image
                    className="rounded-lg shadow-lg"
                    src="/theme/admin/admin-login-page.webp"
                    alt="Admin Login"
                    width={800}
                    height={600}
                    priority={true}
                />
            </div>
            <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-2xl">
                <h2 className="text-2xl font-bold text-center mb-4">
                    {metadataTranslations("title")}
                </h2>

                <form className="space-y-4" action={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium">
                            {contentTranslations("username")}
                        </label>
                        <input
                            type="text"
                            name="username"
                            placeholder="admin"
                            className="w-full px-4 py-2 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">
                            {contentTranslations("password")}
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••"
                            className="w-full px-4 py-2 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                        {contentTranslations("login")}
                    </button>
                </form>
            </div>
        </div>
    );
}

export async function handleLogin(formData: FormData) {
    "use server";
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const response = await fetch(`${process.env.BACKEND_URL}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const data = await response.json();
        const token = data.token;

        (await cookies()).set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        redirect(`/admin`);
    } else {
        console.error("Login failed. Please try again.");
    }
}
