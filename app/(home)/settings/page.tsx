"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Store, CheckCircle, Sparkles, Save, MailCheck, ArrowLeft, ExternalLink } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { IconType } from "react-icons";

interface TabProps {
  id: string;
  name: string;
  icon: IconType;
}

const tabs: TabProps[] = [
  { id: "profile", name: "Profile Settings", icon: User },
  { id: "vendor", name: "Become a Vendor", icon: Store },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState<TabProps>(tabs[0]);

  // Profile Form State
  const [name, setName] = useState(session?.user?.name || "");
  const [prevSessionName, setPrevSessionName] = useState(session?.user?.name);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Synchronize state when session name updates
  if (session?.user?.name !== prevSessionName) {
    setPrevSessionName(session?.user?.name);
    setName(session?.user?.name || "");
  }

  // Vendor Form State
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  
  // OTP State
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [vendorSuccess, setVendorSuccess] = useState<string | null>(null);
  const [vendorError, setVendorError] = useState<string | null>(null);
  const [vendorLoading, setVendorLoading] = useState(false);

  // Dynamic Subdomain Regex Formatting & Root Domain
  const shopSlug = shopName.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  const displayRootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "domainname.com")
    .split(":")[0]
    .replace(/^www\./, "");

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setProfileLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      await update({ name: data.user.name });
      setProfileSuccess("Profile details updated successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setProfileError(err.message);
      } else {
        setProfileError("Failed to update profile");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVendorSuccess(null);
    setVendorError(null);
    setVendorLoading(true);

    try {
      const res = await fetch("/api/user/become-vendor/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName,
          shopDescription,
          phoneNumber,
          storeAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification OTP");
      }

      setOtpStep(true);
      setOtp("");
      setVendorSuccess(`Verification OTP sent to ${session?.user?.email}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setVendorError(err.message);
      } else {
        setVendorError("Failed to send OTP");
      }
    } finally {
      setVendorLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setVendorSuccess(null);
    setVendorError(null);
    setVendorLoading(true);

    try {
      const res = await fetch("/api/user/become-vendor/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp,
          shopName,
          shopDescription,
          phoneNumber,
          storeAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      await update({ role: "vendor" });
      setVendorSuccess("Congratulations! Your Vendor account is verified and activated.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setVendorError(err.message);
      } else {
        setVendorError("Failed to verify OTP");
      }
    } finally {
      setVendorLoading(false);
    }
  };

  const isVendor = session?.user?.role === "vendor" || session?.user?.role === "admin";

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal account details and seller settings
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.name}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab.id === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {Icon && <Icon className="size-4" />}
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile Settings */}
      {activeTab.id === "profile" && (
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              Update your account name and view your registration details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {profileSuccess && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                <CheckCircle className="size-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && <FieldError errors={[{ message: profileError }]} />}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={session?.user?.email || ""}
                    disabled
                    className="bg-muted/50 cursor-not-allowed opacity-80"
                  />
                </Field>

                <Field>
                  <FieldLabel>Current Role</FieldLabel>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {session?.user?.role || "customer"}
                    </span>
                  </div>
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                className="mt-2 font-medium flex items-center gap-2"
                disabled={profileLoading}
              >
                <Save className="size-4" />
                {profileLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Become a Vendor */}
      {activeTab.id === "vendor" && (
        <>
          {isVendor ? (
            <Card className="border border-primary/20 bg-primary/5">
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="size-7" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    You are a Registered Vendor!
                  </h2>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Your account is active with seller capabilities. You can list products, manage inventory, and receive customer orders.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider">
                    <CheckCircle className="size-4" />
                    <span>Vendor Status Active</span>
                  </div>

                  {shopSlug && (
                    <a
                      href={
                        typeof window !== "undefined"
                          ? `${window.location.protocol}//${shopSlug}.${window.location.hostname.replace(/^www\./, "")}${
                              window.location.port ? `:${window.location.port}` : ""
                            }`
                          : `http://${shopSlug}.localhost:3000`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="inline-flex items-center gap-2 py-2">
                        <ExternalLink className="size-4" /> Visit Storefront
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="size-5 text-primary" />
                  Become a Vendor
                </CardTitle>
                <CardDescription>
                  Start selling your products on our multi-vendor marketplace
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {vendorSuccess && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle className="size-4 shrink-0" />
                    <span>{vendorSuccess}</span>
                  </div>
                )}

                {vendorError && <FieldError errors={[{ message: vendorError }]} />}

                {!otpStep ? (
                  /* Step 1: Vendor Details Form */
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="shopName">Shop / Store Name</FieldLabel>
                        <Input
                          id="shopName"
                          type="text"
                          placeholder="e.g. Apex Electronics"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                          Store Subdomain Preview:{" "}
                          <span className="font-mono text-primary font-semibold">
                            https://{shopSlug || "yourstore"}.{displayRootDomain}
                          </span>
                        </p>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="shopDescription">Shop Description</FieldLabel>
                        <Input
                          id="shopDescription"
                          type="text"
                          placeholder="Brief description of what you sell"
                          value={shopDescription}
                          onChange={(e) => setShopDescription(e.target.value)}
                          required
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="phoneNumber">Contact Phone Number</FieldLabel>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="storeAddress">Store / Business Address</FieldLabel>
                        <Input
                          id="storeAddress"
                          type="text"
                          placeholder="123 Business St, City, Country"
                          value={storeAddress}
                          onChange={(e) => setStoreAddress(e.target.value)}
                        />
                      </Field>
                    </FieldGroup>

                    <Button
                      type="submit"
                      className="w-full py-5 font-medium flex items-center justify-center gap-2"
                      disabled={vendorLoading}
                    >
                      <MailCheck className="size-4" />
                      {vendorLoading ? "Sending Verification OTP..." : "Register as Vendor"}
                    </Button>
                  </form>
                ) : (
                  /* Step 2: OTP Verification Form with Shadcn InputOTP */
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 border space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Enter Verification Code
                      </p>
                      <p className="text-xs text-muted-foreground">
                        A 6-digit OTP code has been sent to <strong>{session?.user?.email}</strong>.
                      </p>
                    </div>

                    <FieldGroup>
                      <Field>
                        <FieldLabel className="text-center block">6-Digit OTP</FieldLabel>
                        <div className="flex justify-center pt-2">
                          <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={(val) => setOtp(val)}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </Field>
                    </FieldGroup>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOtpStep(false)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <ArrowLeft className="size-3" /> Edit Details
                      </Button>

                      <Button
                        type="submit"
                        className="flex-1 py-5 font-medium"
                        disabled={vendorLoading || otp.length < 6}
                      >
                        {vendorLoading ? "Verifying OTP..." : "Verify & Activate Vendor"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
