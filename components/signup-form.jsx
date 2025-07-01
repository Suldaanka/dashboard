"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignUp from "@clerk/elements/sign-up";

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

export function SignUpForm({
  className,
  ...props
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <SignUp.Root>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">SignUp</CardTitle>
          </CardHeader>
          <CardContent>
            <SignUp.Step name="start">
              <Clerk.Field name="emailAddress" className="flex flex-col gap-2">
                <Clerk.Label asChild>
                  <Label>Email</Label>
                </Clerk.Label>
                <Clerk.Input asChild>
                  <Input placeholder="Email Address"></Input>
                </Clerk.Input>
                <Clerk.FieldError />
              </Clerk.Field>

              <Clerk.Field name="password" className="flex flex-col gap-2 mt-2">
                <Clerk.Label asChild>
                  <Label>Password</Label>
                </Clerk.Label>
                <Clerk.Input asChild>
                  <Input placeholder="Password"></Input>
                </Clerk.Input>
                <Clerk.FieldError />
              </Clerk.Field>
              
              <div className="mt-2">
                <SignUp.Action submit asChild className="w-full">
                  <Button>Sign up</Button>
                </SignUp.Action>
              <div id="clerk-captcha"></div>
              </div>
              <div className="flex flex-col gap-4 mt-5">
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
            </SignUp.Step>
            <SignUp.Step name="verifications">
              <SignUp.Strategy name="email_code">
                <h1 className="text-center">Check your email</h1>

                <Clerk.Field name="code" className="flex flex-col gap-2">
                  <Clerk.Label asChild>
                    <Label>Email Code</Label>
                  </Clerk.Label>
                  <Clerk.Input asChild>
                    <Input placeholder="Code"></Input>
                  </Clerk.Input>
                  <Clerk.FieldError />
                </Clerk.Field>

                <SignUp.Action submit asChild>
                  <Button className="w-full mt-2">Verify</Button>
                </SignUp.Action>
              </SignUp.Strategy>
            </SignUp.Step>
            <div className="text-center text-sm mt-5">
              Don&apos;t have an account?{" "}
              <Link href="/sign-in" className="underline underline-offset-4">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </SignUp.Root>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
