"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  PlusCircle,
  UploadCloud,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
  Package,
  Layers,
  FileText,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "@/components/ui/attachment";
import { optimizeImage } from "@/app/lib/image-optimizer";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface UploadedAttachment {
  id: string;
  file?: File;
  name: string;
  size: string;
  url?: string;
  state: "uploading" | "done" | "error";
  error?: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Maximum file size limit: 5 MB
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  // Categories list
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [customSlugEdited, setCustomSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("10");
  const [tagsInput, setTagsInput] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const selectedCategory = categories.find((c) => c._id === categoryId);

  // Attachments State
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Handle product name change and auto-generate slug unless manually edited
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!customSlugEdited) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  };

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/category");
        const data = await res.json();
        if (res.ok && data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setCategoryId(data.categories[0]._id);
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Process, optimize and upload image to Cloudinary API
  const processAndUploadImage = async (file: File, attachmentId: string) => {
    try {
      // 1. Client-side Image Optimization (Resize max 1920x1920 & Compress quality 0.82)
      const optimizedFile = await optimizeImage(file);

      // Update attachment size to reflect compressed file size
      setAttachments((prev) =>
        prev.map((att) =>
          att.id === attachmentId
            ? { ...att, size: formatFileSize(optimizedFile.size) }
            : att
        )
      );

      // 2. Validate max size limit (5 MB)
      if (optimizedFile.size > MAX_FILE_SIZE) {
        throw new Error("File size exceeds maximum limit of 5 MB");
      }

      // 3. Upload to Cloudinary API
      const formData = new FormData();
      formData.append("file", optimizedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      setAttachments((prev) =>
        prev.map((att) =>
          att.id === attachmentId
            ? { ...att, state: "done", url: data.url }
            : att
        )
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Upload failed";
      setAttachments((prev) =>
        prev.map((att) =>
          att.id === attachmentId
            ? { ...att, state: "error", error: errorMsg }
            : att
        )
      );
    }
  };

  // Handle image file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);

    newFiles.forEach((file) => {
      const attachmentId = Math.random().toString(36).substring(2, 9);
      const newAtt: UploadedAttachment = {
        id: attachmentId,
        file,
        name: file.name,
        size: formatFileSize(file.size),
        state: "uploading",
      };

      setAttachments((prev) => [...prev, newAtt]);
      processAndUploadImage(file, attachmentId);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove attachment
  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  // Submit Product Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess(null);
    setFormError(null);

    // Validation
    if (!name.trim()) {
      setFormError("Product name is required.");
      return;
    }

    if (!description.trim()) {
      setFormError("Product description is required.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setFormError("Please enter a valid regular price.");
      return;
    }

    if (!categoryId) {
      setFormError("Please select a product category.");
      return;
    }

    const uploadedUrls = attachments
      .filter((att) => att.state === "done" && att.url)
      .map((att) => att.url as string);

    if (uploadedUrls.length === 0) {
      setFormError("Please upload at least one product image.");
      return;
    }

    setFormSubmitting(true);

    try {
      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : undefined,
        stock: Number(stock),
        tags: tagsArray,
        category: categoryId,
        images: uploadedUrls,
      };

      const res = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      setFormSuccess("Product created successfully!");

      setName("");
      setSlug("");
      setDescription("");
      setCategoryId("");
      setCustomSlugEdited(false);
      setStock("");
      setPrice("");
      setSalePrice("");
      setTagsInput("");
      setAttachments([]);


    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create product";
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <Card className="border border-border/70 shadow-sm max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <PlusCircle className="size-5 text-primary" />
          Add New Product
        </CardTitle>
        <CardDescription>
          Fill in the details below to add a new item to your store catalog
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {formSuccess && (
            <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Product Name & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-name" className="font-semibold text-sm">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-name"
                placeholder="e.g. Wireless Bluetooth Headphones"
                value={name}
                onChange={handleNameChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-slug" className="font-semibold text-sm">
                Product Slug (URL)
              </Label>
              <Input
                id="product-slug"
                placeholder="wireless-bluetooth-headphones"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setCustomSlugEdited(true);
                }}
              />
            </div>
          </div>

          {/* Category & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-category" className="font-semibold text-sm flex items-center gap-1.5">
                <Layers className="size-4 text-primary" />
                Category <span className="text-destructive">*</span>
              </Label>
              {loadingCategories ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="size-4 animate-spin" /> Loading categories...
                </div>
              ) : (
                <Select
                  value={categoryId}
                  onValueChange={(val) => setCategoryId(val as string)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category">
                      {selectedCategory ? selectedCategory.name : "Select a category"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-stock" className="font-semibold text-sm flex items-center gap-1.5">
                <Package className="size-4 text-primary" />
                Stock Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-stock"
                type="number"
                min="0"
                placeholder="10"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-price" className="font-semibold text-sm flex items-center gap-1.5">
                <DollarSign className="size-4 text-primary" />
                Regular Price ($) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="99.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-sale-price" className="font-semibold text-sm flex items-center gap-1.5">
                <Tag className="size-4 text-primary" />
                Sale Price ($) <span className="text-xs text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="product-sale-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="79.99"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="product-description" className="font-semibold text-sm flex items-center gap-1.5">
              <FileText className="size-4 text-primary" />
              Product Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="product-description"
              rows={4}
              placeholder="Describe product features, specifications, and details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="product-tags" className="font-semibold text-sm">
              Tags <span className="text-xs text-muted-foreground">(Comma separated)</span>
            </Label>
            <Input
              id="product-tags"
              placeholder="wireless, audio, bluetooth, noise-canceling"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          {/* Images Attachment Upload Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm">
                Product Images <span className="text-destructive">*</span>
              </Label>
              <span className="text-xs text-muted-foreground">
                Max size: 5 MB (Auto-optimized)
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Drag & Drop / Upload Trigger Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40 space-y-2"
            >
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UploadCloud className="size-6" />
              </div>
              <div className="text-sm font-medium text-foreground">
                Click to upload product images
              </div>
              <p className="text-xs text-muted-foreground">
                Supports PNG, JPG, WEBP up to 5MB (Auto-compressed before Cloudinary upload)
              </p>
            </div>

            {/* Display Attachments using Shadcn Attachment Component */}
            {attachments.length > 0 && (
              <div className="pt-2 space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Uploaded Attachments ({attachments.length})
                </span>
                <AttachmentGroup className="flex flex-wrap gap-3">
                  {attachments.map((att) => (
                    <Attachment
                      key={att.id}
                      state={att.state}
                      size="default"
                      orientation="horizontal"
                      className="relative border shadow-sm"
                    >
                      <AttachmentMedia variant={att.url ? "image" : "icon"}>
                        {att.url ? (
                          <Image
                            src={att.url}
                            alt={att.name}
                            width={40}
                            height={40}
                            className="size-full object-cover rounded-lg"
                          />
                        ) : att.state === "uploading" ? (
                          <Loader2 className="size-4 animate-spin text-primary" />
                        ) : (
                          <AlertCircle className="size-4 text-destructive" />
                        )}
                      </AttachmentMedia>

                      <AttachmentContent>
                        <AttachmentTitle>{att.name}</AttachmentTitle>
                        <AttachmentDescription>
                          {att.state === "uploading"
                            ? "Optimizing & uploading..."
                            : att.state === "error"
                            ? att.error || "Upload failed"
                            : att.size}
                        </AttachmentDescription>
                      </AttachmentContent>

                      <AttachmentActions>
                        <AttachmentAction
                          onClick={() => removeAttachment(att.id)}
                          title="Remove image"
                        >
                          <X className="size-4 text-muted-foreground hover:text-destructive" />
                        </AttachmentAction>
                      </AttachmentActions>
                    </Attachment>
                  ))}
                </AttachmentGroup>
              </div>
            )}
          </div>



          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/my-products")}
              disabled={formSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={formSubmitting}
              className="inline-flex items-center gap-2 font-semibold min-w-[140px]"
            >
              {formSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <PlusCircle className="size-4" /> Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
