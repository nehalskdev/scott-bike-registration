import React from "react";
import { useFormContext } from "react-hook-form";
import { CircleCheck } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { useStepper } from "@/src/components/ui/stepper";
import { Input } from "@/src/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/src/components/ui/form";
import DatePicker from "@/src/components/ui/date-picker";

import { BikeRegistrationFormData } from "../schemas/registration-schema";
import BikeInfoCard from "../form/bike-info-card";

/**
 * Step 2: Bike Information
 * Displays verified bike details and allows selection of purchase date
 */
const BikeInformationStep = (): React.JSX.Element => {
  const { control, watch } = useFormContext<BikeRegistrationFormData>();
  const { prevStep, nextStep, setStepCompleted } = useStepper();
  const dateOfPurchase = watch("dateOfPurchase");

  return (
    <div className="space-y-6">
      <div className="max-w-md space-y-4">
        {/* Serial Number - Read Only */}
        <FormField
          control={control}
          name="serialNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial Number</FormLabel>
              <FormControl>
                <Input disabled {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription className="text-green-500 text-xs items-center flex gap-1 font-bold">
                <CircleCheck size={14} />
                Serial Number verified
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Bike Image */}
        <BikeInfoCard imageSize={400} showDescription={false} />

        {/* Model Description - Read Only */}
        <FormField
          control={control}
          name="modelDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Description</FormLabel>
              <FormControl>
                <Input disabled {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Shop Name - Read Only */}
        <FormField
          control={control}
          name="shopName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Name</FormLabel>
              <FormControl>
                <Input disabled {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of Purchase */}
        <FormField
          control={control}
          name="dateOfPurchase"
          render={({ field }) => (
            <DatePicker field={field} label="Date of Purchase" />
          )}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-end gap-4 mt-8 mb-8">
        <Button
          variant="link"
          type="button"
          onClick={prevStep}
          className="text-blue-600 text-sm"
        >
          THIS IS NOT MY BIKE
        </Button>

        <Button
          disabled={!dateOfPurchase}
          type="button"
          size="lg"
          onClick={() => {
            setStepCompleted(1, true);
            nextStep();
          }}
          variant="default"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default BikeInformationStep;
