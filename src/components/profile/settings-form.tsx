"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function SettingsForm({ user }: { user: any }) {
  const router = useRouter();
  const { update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatar, setAvatar] = useState(user.image || "");

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user.name || "",
      bio: user.bio || "",
    }
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      setAvatar(data.url);
      
      // Auto-save image to profile
      await fetch("/api/v1/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePhoto: data.url, image: data.url })
      });
      
      toast.success("Profile photo updated");
      await update({ image: data.url });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, profilePhoto: avatar, image: avatar })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to update settings");
      }

      toast.success("Settings updated successfully");
      await update({ name: data?.name, image: avatar });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Details</CardTitle>
        <CardDescription>Update your public profile information and photo.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border relative group">
              {avatar ? (
                <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-slate-300">{user.name?.[0] || 'U'}</span>
              )}
              
              <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white">
                {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                <span className="text-[10px] mt-1 font-medium">Upload</span>
                <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={isUploading} />
              </label>
            </div>
            
            <div className="flex-1 space-y-1">
              <h3 className="font-medium text-sm">Profile Photo</h3>
              <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 5MB.</p>
              <Button type="button" variant="outline" size="sm" className="mt-2 relative">
                {isUploading ? "Uploading..." : "Change Photo"}
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={isUploading} />
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input {...register("name", { required: "Name is required" })} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message as string}</p>}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input value={user.email} disabled className="bg-slate-50" />
            <p className="text-xs text-muted-foreground">Email addresses cannot be changed directly for security reasons.</p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea 
              {...register("bio")} 
              placeholder="Tell us a little bit about yourself..."
              className="resize-none h-24"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
