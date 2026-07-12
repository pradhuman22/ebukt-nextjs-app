"use client";
import z from "zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Session } from "@/lib/auth";
import { deleteImage, getPresignedUploadUrl } from "@/lib/upload";
import { IconArrowUp, IconLoader, IconUserCheck } from "@tabler/icons-react";
import { updateAccountSchema } from "@/schema/setting-schema";

type FORMDATA = z.infer<typeof updateAccountSchema>;

const UpdateAccountForm = ({ user }: { user: Session["user"] | null }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FORMDATA>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      image: user?.image || "",
      bio: user?.bio || "",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 1. Instant Client-side Preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);
    try {
      const currentImage = form.getValues("image");
      if (currentImage) {
        const deleteRes = await deleteImage(currentImage);
        if (!deleteRes?.success) {
          toast.error("Failed To Upload.");
        }
        router.refresh();
      }
      const { signedUrl, key } = await getPresignedUploadUrl(
        file.name,
        file.type
      );
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      form.setValue("image", key);
      toast.success("Profile picture updated!");
    } catch (error) {
      console.log(error);
      toast.error("something went wrong");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };
  const onSubmit = ({ image, name, bio }: FORMDATA) => {
    startTransition(async () => {
      console.log(name);
      await authClient.updateUser(
        {
          image,
          name,
          bio,
        },
        {
          onError: () => {
            toast.error("Failed to update profile");
          },
          onSuccess: () => {
            toast.success("Updated successfully");
            router.refresh();
          },
        }
      );
    });
  };
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col justify-between gap-20 md:flex-row">
        <div className="order-2 flex-3/4 space-y-4">
          <FieldGroup>
            {/* name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="name"
                    className="text-foreground text-base"
                  >
                    Name
                  </FieldLabel>
                  <Input
                    placeholder="Enter your name or nickname."
                    {...field}
                    className="text-lg placeholder:text-base"
                    disabled={pending}
                  />
                </Field>
              )}
            />
            {/* bio */}
            <Controller
              name="bio"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="bio"
                    className="text-foreground text-base"
                  >
                    Bio
                  </FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Write something that describes you."
                    className="h-40 text-lg placeholder:text-base"
                    disabled={pending}
                  />
                </Field>
              )}
            />
            <Field orientation={"horizontal"}>
              <Button
                type="submit"
                className="cursor-pointer text-sm"
                disabled={pending}
              >
                {pending ? (
                  <IconLoader className="animate-spin" />
                ) : (
                  <IconUserCheck />
                )}
                Save Changes
              </Button>
            </Field>
          </FieldGroup>
        </div>
        <div className="order-1 flex-1/4 md:order-2">
          <FieldGroup>
            <Controller
              name="image"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="relative mx-auto flex max-w-40 cursor-pointer items-center justify-center rounded-full border"
                  >
                    {process.env.NEXT_AWS_BUCKET_NAME_S3}
                    <Avatar className="h-40 w-40">
                      <AvatarImage
                        src={
                          previewUrl ||
                          `https://edme-s3-bucket.t3.storage.dev/${form.getValues("image")}` ||
                          undefined
                        }
                        alt={form.getValues("name")}
                        className={isUploading ? "opacity-50" : "opacity-100"}
                      />
                      <AvatarFallback className="text-2xl">
                        {user?.name.charAt(0) || "U"}
                      </AvatarFallback>
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
                          <IconLoader
                            className="animate-spin text-white"
                            size={32}
                          />
                        </div>
                      )}
                      <AvatarBadge className="right-0 bottom-2 group-data-[size=default]/avatar:size-10 group-data-[size=default]/avatar:[&>svg]:size-6">
                        <IconArrowUp />
                      </AvatarBadge>
                    </Avatar>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    hidden
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleFileChange}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </div>
      </div>
    </form>
  );
};

export default UpdateAccountForm;
