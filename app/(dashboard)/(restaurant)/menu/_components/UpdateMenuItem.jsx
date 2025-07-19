"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Import your custom hooks
import { useMutate } from "@/hooks/useMutate";
import { useFetch } from "@/hooks/useFetch";

const FormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  price: z.string()
    .min(1, { message: "Price is required." })
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, {
      message: "Price must be a valid positive number.",
    }),
  category: z.string().min(1, { message: "Category is required." }),
  description: z.string().optional(),
  status: z.enum(["AVAILABLE", "OUT_OF_STOCK", "HIDDEN"]),
});

export function UpdateMenuItem({ id }) {
  const router = useRouter();

  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    data: menuItem,
    isLoading: isFetchingMenuItem,
    error: fetchError,
  } = useFetch(`/api/menu/${id}`, ["menuItem", id]);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      price: "",
      category: "",
      description: "",
      status: "AVAILABLE",
    },
  });

  const { execute: updateMenuItem, isMutating: isSubmitting } = useMutate(
    `/api/menu/update/${id}`,
    ["menuItems", "menuItem", id],
    {
      method: "POST",
      onSuccess: () => {
        toast.success("Menu item updated successfully!");
        router.push("/menu");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update menu item");
      },
    }
  );

  const { isDirty } = form.formState;

  useEffect(() => {
    if (menuItem) {
      let parsedImages = [];

      if (menuItem.imageUrl) {
        try {
          const parsed = JSON.parse(menuItem.imageUrl);
          parsedImages = Array.isArray(parsed) ? parsed : [menuItem.imageUrl];
        } catch (err) {
          parsedImages = [menuItem.imageUrl];
        }
      }

      form.reset({
        name: menuItem.name || "",
        price: menuItem.price ? String(menuItem.price) : "",
        category: menuItem.category || "",
        description: menuItem.description || "",
        status: menuItem.status || "AVAILABLE",
      });

      setExistingImageUrls(parsedImages);
      setImagePreviews(parsedImages);
      setNewImageFiles([]);
      setCurrentImageIndex(0);
    }
  }, [menuItem, form]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviews]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const previews = files.map((file) => URL.createObjectURL(file));

    setNewImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (indexToRemove) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== indexToRemove);
    setImagePreviews(newPreviews);

    if (indexToRemove < existingImageUrls.length) {
      const newExistingUrls = existingImageUrls.filter((_, i) => i !== indexToRemove);
      setExistingImageUrls(newExistingUrls);
    } else {
      const newIndex = indexToRemove - existingImageUrls.length;
      const newFiles = newImageFiles.filter((_, i) => i !== newIndex);
      setNewImageFiles(newFiles);
      
      const removedUrl = imagePreviews[indexToRemove];
      if (removedUrl && removedUrl.startsWith("blob:")) {
        URL.revokeObjectURL(removedUrl);
      }
    }

    if (currentImageIndex >= newPreviews.length) {
      setCurrentImageIndex(Math.max(0, newPreviews.length - 1));
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imagePreviews.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imagePreviews.length - 1 : prev - 1
    );
  };

  async function onSubmit(data) {
    try {
      const priceValue = parseFloat(data.price);
      if (isNaN(priceValue) || priceValue < 0) {
        toast.error("Please enter a valid price");
        return;
      }

      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("price", priceValue.toString());
      formData.append("category", data.category);
      formData.append("description", data.description || "");
      formData.append("status", data.status);

      if (existingImageUrls.length > 0) {
        formData.append("existingImages", JSON.stringify(existingImageUrls));
      } else {
        formData.append("existingImages", JSON.stringify([]));
      }

      newImageFiles.forEach((file) => {
        formData.append(`newImages`, file);
      });

      await updateMenuItem(formData);
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast.error("Failed to update menu item");
    }
  }

  const getStatusColor = (status) => {
    if (status === "AVAILABLE") return "bg-green-500";
    if (status === "OUT_OF_STOCK") return "bg-yellow-500";
    if (status === "HIDDEN") return "bg-gray-500";
    return "";
  };

  const watchedValues = form.watch();

  if (isFetchingMenuItem) {
    return <div className="text-center p-8">Loading menu item...</div>;
  }

  if (fetchError) {
    return (
      <div className="text-center p-8 text-red-500">
        Error loading menu item: {fetchError.message || "Failed to fetch data"}
      </div>
    );
  }

  if (!id || !menuItem) {
    return (
      <div className="text-center p-8 text-red-500">
        Menu item not found or ID is invalid.
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 cursor-pointer pb-5" onClick={() => router.back()}>
        <ArrowLeft className="cursor-pointer" /> <span>Back to Menu</span>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <div className="w-full lg:w-2/3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Chicken Burger" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="w-full sm:w-1/2">
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="9.99" 
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="w-full sm:w-1/2">
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Course" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Details about the dish..."
                        className="h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <div className="flex flex-col space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                    {imagePreviews.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              className="w-16 h-16 object-cover rounded-md border"
                              alt={`Preview ${index + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-md text-center">
                        <p className="text-sm text-gray-500">No images selected</p>
                        <p className="text-xs text-gray-400">This menu item will have no images</p>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Upload new images or keep existing ones. You can remove all images if needed.
                </FormDescription>
              </FormItem>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                        <SelectItem value="HIDDEN">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-2"
              >
                {isSubmitting ? "Updating..." : "Update Menu Item"}
              </Button>
            </form>
          </Form>
        </div>

        <div className="w-full lg:w-1/3">
          <h2 className="text-base font-medium mb-2">Preview</h2>
          <Card className="w-full overflow-hidden py-0">
            <div className={`${imagePreviews.length > 0 ? "h-32" : "h-20"} w-full`}>
              {imagePreviews.length > 0 ? (
                <div className="relative h-full w-full">
                  <img
                    src={imagePreviews[currentImageIndex]}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  {imagePreviews.length > 1 && (
                    <div className="absolute bottom-1 right-1 flex gap-1">
                      <Button size="sm" variant="secondary" onClick={prevImage}>
                        &lt;
                      </Button>
                      <Button size="sm" variant="secondary" onClick={nextImage}>
                        &gt;
                      </Button>
                    </div>
                  )}
                  <div className="absolute top-1 right-1">
                    <Badge className={`${getStatusColor(watchedValues.status)} text-xs px-1`}>
                      {watchedValues.status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">No image</p>
                </div>
              )}
            </div>

            <CardHeader className="p-3">
              <CardTitle className="text-base">{watchedValues.name || "Menu Item Name"}</CardTitle>
              <CardDescription className="text-xs">{watchedValues.category || "Category"}</CardDescription>
            </CardHeader>

            <CardContent className="px-3 py-0">
              <p className="text-lg font-semibold text-green-600 mb-2">
                ${watchedValues.price || "0.00"}
              </p>
              <p className="text-xs text-gray-600 line-clamp-2">
                {watchedValues.description || "No description"}
              </p>
            </CardContent>

            <CardFooter className="p-2">
              <div className="text-xs text-gray-500">
                {imagePreviews.length === 0 ? "No images" : 
                 `${imagePreviews.length} ${imagePreviews.length === 1 ? "image" : "images"}`}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}