"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import "./loginbox.css";
import { json } from "stream/consumers";
import { useRouter } from "next/navigation";

function LoginBox() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = { email: email, password: password };

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  };
}
