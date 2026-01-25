"use client";
import React, { useCallback, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";

import { Form } from "@/src/components/ui/form";
import {
  Step,
  StepContent,
  StepperIndicators,
  StepTitle,
  useStepper,
} from "@/src/components/ui/stepper";
import { Button } from "@/src/components/ui/button";

import {
  bikeRegistrationInitialData,
  BikeRegistrationFormData,
  bikeRegistrationSchema,
} from "../schemas/registration-schema";
import {
  registerBike,
  BikeRegistrationError,
} from "../services/bike-registration";
import SerialNumberStep from "../steps/serial-number-step";
import BikeInformationStep from "../steps/bike-information-step";
import PersonalInformationStep from "../steps/personal-information-step";
import ConfirmationStep from "../steps/confirmation-step";
import BikeInfoCard from "./bike-info-card";

/**
 * Main bike registration form component
 * Orchestrates multi-step registration process
 */
const RegistrationForm = (): React.JSX.Element => {
  const [confirmation, setConfirmation] = useState({
    success: false,
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<BikeRegistrationFormData>({
    resolver: zodResolver(bikeRegistrationSchema),
    defaultValues: bikeRegistrationInitialData,
    mode: "onChange",
  });

  const { setStepCompleted, nextStep, prevStep } = useStepper();

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback<SubmitHandler<BikeRegistrationFormData>>(
    async (data) => {
      try {
        setIsLoading(true);

        // Validate data
        const validationResult = bikeRegistrationSchema.safeParse(data);
        if (!validationResult.success) {
          return;
        }

        // Submit registration
        const response = await registerBike(data);
        setConfirmation({
          success: response.success,
          message: response.message,
        });
      } catch (error) {
        console.error("Registration error:", error);

        const errorMessage =
          error instanceof Object && "message" in error
            ? (error as BikeRegistrationError).message
            : "Registration failed. Please try again.";

        setConfirmation({
          success: false,
          message: errorMessage,
        });
      } finally {
        setIsLoading(false);
        setStepCompleted(2, true);
        nextStep();
      }
    },
    [setStepCompleted, nextStep],
  );

  /**
   * Render navigation buttons for personal information step
   */
  const NavigationButtons = useMemo(
    () => (
      <div className="mt-8 mb-7 flex justify-end gap-2">
        <Button
          size="lg"
          variant="link"
          type="button"
          onClick={prevStep}
          className="text-blue-600 text-sm uppercase"
        >
          Previous
        </Button>
        <Button
          size="lg"
          type="submit"
          disabled={!form.formState.isValid || isLoading}
          variant="default"
          className="tracking-wider min-w-40"
        >
          {isLoading ? (
            <LoaderCircle size={40} className="animate-spin size-6 font-bold" />
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    ),
    [prevStep, form.formState.isValid, isLoading],
  );

  /**
   * Step configuration
   */
  const steps = useMemo(
    () => [
      {
        title: "Serial number",
        component: <SerialNumberStep />,
        showBikeCard: false,
      },
      {
        title: "Bike information",
        component: <BikeInformationStep />,
        showBikeCard: false,
      },
      {
        title: "Personal information",
        component: <PersonalInformationStep />,
        showBikeCard: true,
      },
      {
        title: "Registration confirmation",
        component: (
          <ConfirmationStep
            message={confirmation.message}
            success={confirmation.success}
          />
        ),
        showBikeCard: false,
      },
    ],
    [confirmation],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="pb-8">
        <StepperIndicators labels={steps.map((s) => s.title)} />

        {steps.map((step, index) => (
          <Step key={index} index={index}>
            <div className="space-y-6">
              {step.showBikeCard && <BikeInfoCard imageSize={150} />}

              <StepTitle
                className="text-2xl text-neutral-500 md:text-3xl font-brandon uppercase font-extrabold tracking-wider"
                stepNumber={index}
              >
                {step.title}
              </StepTitle>

              <StepContent>
                {step.component}
                {index === 2 && NavigationButtons}
              </StepContent>
            </div>
          </Step>
        ))}
      </form>
    </Form>
  );
};

export default RegistrationForm;
