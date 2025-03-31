import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { object as zObject, string as zString } from "zod";
import {
  Form as SCForm,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@app/components/ui/form";
import { Input } from "@app/components/ui/input";
import { Button } from "@app/components/ui/button";
import { FreeCounsellingFormData } from "./types";
import { fetchWithTimeout } from "@app/utils/fetch-utils";
import { apiEndPoints, apiPath } from "@app/config/api-config";
import { useRouter } from "next/router";

const formSchema = zObject({
  fullName: zString().min(2, "Full Name must be at least 2 characters."),
  email: zString().email("Invalid email address."),
  whatsappNumber: zString().regex(
    /^\d{10}$/,
    "WhatsApp Number must be a 10-digit number."
  ),
  targetYear: zString().min(4, "Please enter a valid year."),
  targetCountry: zString().min(
    2,
    "Target Country must be at least 2 characters."
  ),
  targetCourse: zString().min(
    2,
    "Target Course must be at least 2 characters."
  ),
});

export const Form = () => {
  const navigation = useRouter();
  const form = useForm<FreeCounsellingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      whatsappNumber: "",
      targetYear: "",
      targetCountry: "",
      targetCourse: "",
    },
  });

  async function onSubmit(values: FreeCounsellingFormData) {
    console.log(values);
    const response = await fetchWithTimeout(
      `${apiEndPoints}${apiPath.freeCounsellingForm}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }
    );
    if (!response.success) {
      console.error(response.error.message);
      if (response.error.status === 400) {
        alert(response.error.message);
        return;
      }
      alert("Error in submitting form. Please try after some time.");
      return;
    }
    alert("Form submitted successfully.");
    navigation.reload();
  }

  return (
    <SCForm {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-2 p-4 rounded-lg shadow-md border bg-white"
      >
        <h2 className="text-xl font-semibold text-center mb-4">
          Get Free Counselling
        </h2>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="whatsappNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="Enter your WhatsApp number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Year</FormLabel>
              <FormControl>
                <Input placeholder="Enter your target year" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetCountry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Country</FormLabel>
              <FormControl>
                <Input placeholder="Enter your target country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetCourse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Course</FormLabel>
              <FormControl>
                <Input placeholder="Enter your target course" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 font-semibold"
        >
          Request Counselling
        </Button>
      </form>
    </SCForm>
  );
};
