"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  //CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import Link from "next/link";

export function SignInForm({
  className,
  ...props
}) {
 
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <SignIn.Root>
        <Card>
          <CardHeader className="text-center">
              <CardTitle className="text-xl">SignIn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <SignIn.Step name="start">
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Clerk.Field
                      name="identifier"
                      className="flex flex-col gap-y-2"
                    >
                      <Clerk.Label asChild>
                        <Label>Email</Label>
                      </Clerk.Label>
                      <Clerk.Input asChild>
                        <Input placeholder="Enter Email" />
                      </Clerk.Input>
                      <Clerk.FieldError />
                    </Clerk.Field>
                    <SignIn.Action submit asChild>
                      <Button>Continue</Button>
                    </SignIn.Action>
                  </div>
                  <div className="flex flex-col gap-4">
                  <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or
                  </span>
                </div>
                  <Clerk.Connection name="google" asChild>
                    <Button variant="outline">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        width="100"
                        height="100"
                        viewBox="0 0 48 48"
                      >
                        <path
                          fill="#FFC107"
                          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                        ></path>
                        <path
                          fill="#FF3D00"
                          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                        ></path>
                        <path
                          fill="#4CAF50"
                          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                        ></path>
                        <path
                          fill="#1976D2"
                          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                        ></path>
                      </svg>
                      Continue with Google
                    </Button>
                  </Clerk.Connection>
                </div>
                </div>
              </SignIn.Step>
              <SignIn.Step name="verifications">
                <SignIn.Strategy name="email_code">
                  <h1>Check your email</h1>
                  <p>
                    We sent a code to <SignIn.SafeIdentifier />.
                  </p>

                  <Clerk.Field name="code">
                    <Clerk.Label>Email code</Clerk.Label>
                    <Clerk.Input />
                    <Clerk.FieldError />
                  </Clerk.Field>

                  <SignIn.Action submit>Continue</SignIn.Action>
                </SignIn.Strategy>

                <SignIn.Strategy name="password">
                  <h1 className="text-center">Enter your password</h1>

                  <Clerk.Field name="password" className="flex gap-2 flex-col">
                    <Clerk.Label asChild>
                      <Label>Password</Label>
                    </Clerk.Label>
                    <Clerk.Input asChild>
                      <Input placeholder="Password" />
                    </Clerk.Input>
                    <Clerk.FieldError />
                  </Clerk.Field>
                  <div className="flex flex-col gap-2">
                    <SignIn.Action
                      navigate="forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline mt-2"
                    >
                      Forgot password?
                    </SignIn.Action>
                    <SignIn.Action submit asChild>
                      <Button className="w-full">Continue</Button>
                    </SignIn.Action>
                  </div>
                </SignIn.Strategy>

                <SignIn.Strategy name="reset_password_email_code">
                  <h1 className="text-center">Check your email</h1>
                  <div className="flex flex-col gap-2">
                    <p className="text-center">
                      <SignIn.SafeIdentifier />.
                    </p>
                    <Clerk.Field name="code">
                      <Clerk.Input asChild>
                        <Input placeholder="Code" />
                      </Clerk.Input>
                      <Clerk.FieldError />
                    </Clerk.Field>

                    <SignIn.Action submit asChild>
                      <Button>Continue</Button>
                    </SignIn.Action>
                  </div>
                </SignIn.Strategy>
              </SignIn.Step>

              <SignIn.Step name="forgot-password">
                <h1 className="text-center">Forgot your password?</h1>
                <div className="flex flex-col gap-2 mt-2">
                <SignIn.SupportedStrategy name="reset_password_email_code" asChild>
                 <Button>
                  Reset password
                 </Button>
                </SignIn.SupportedStrategy>

                <SignIn.Action navigate="previous" className="ml-auto text-sm underline-offset-4 hover:underline">Go back</SignIn.Action>
                </div>
              </SignIn.Step>

              <SignIn.Step name="reset-password">
                <h1 className="text-center">Reset your password</h1>
                <div className="flex flex-col gap-2">
                <Clerk.Field name="password" className="flex flex-col gap-2">
                  <Clerk.Label asChild>
                    <Label>New password</Label>
                  </Clerk.Label>
                  <Clerk.Input asChild>
                    <Input placeholder="New Password" />
                  </Clerk.Input>
                  <Clerk.FieldError />
                </Clerk.Field>

                <Clerk.Field name="confirmPassword" className="flex flex-col gap-2">
                  <Clerk.Label asChild>
                    <Label>Confirm password</Label>
                  </Clerk.Label>
                  <Clerk.Input asChild>
                    <Input placeholder="Confirm Password" />
                  </Clerk.Input>
                  <Clerk.FieldError />
                </Clerk.Field>

                <SignIn.Action submit asChild>
                  <Button>
                    Reset password
                  </Button>
                </SignIn.Action>
                </div>
              </SignIn.Step>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </SignIn.Root>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
