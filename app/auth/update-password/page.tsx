import { Suspense } from "react";
import UpdatePasswordClient from "./UpdatePasswordClient";

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <UpdatePasswordClient />
    </Suspense>
  );
}
