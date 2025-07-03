import { IAction } from '1pd-types';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from '@tanstack/react-router';
import React from 'react';
import {
  Controller,
  FormProvider,
  useForm,
} from 'react-hook-form';
import * as yup from 'yup';
import { Button } from '@/shared/ui';
import { FormErrorMessage } from '@/shared/ui/FormErrorMessage';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { createDisputeSchema } from '@/entities/disputes/model/createDisputeSchema';
import { disputeToForm } from '@/entities/disputes/model/disputeToForm';

interface DisputeFormProps {
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: IAction;
}

type DisputeFormValues = yup.InferType<typeof createDisputeSchema>;

export const DisputeForm = ({ onSubmit, defaultValues }: DisputeFormProps) => {
  const form = useForm<DisputeFormValues>({
    resolver: yupResolver(createDisputeSchema),
    defaultValues: defaultValues ? disputeToForm(defaultValues) : {},
    mode: 'onChange',
  });

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Controller
          name="title"
          control={form.control}
          render={({ field }) => (
            <Input
              label="Title"
              className="w-full"
              {...field}
              required
              errorMessage={form.formState.errors?.title?.message}
            />
          )}
        />
        <div>
          <Controller
            name="description"
            control={form.control}
            render={({ field }) => (
              <Textarea
                label="Description"
                className="w-full"
                {...field}
                required
              />
            )}
          />
          <FormErrorMessage errors={form.formState.errors} name="description" />
        </div>
        <div className="flex justify-center gap-7">
          <Button
            className="border bg-blue-700 text-white rounded-md hover:bg-blue-400 w-[160px]"
            onClick={form.handleSubmit(onSubmit)}
          >
            Save
          </Button>
          <Link to={'/actions'}>
            <Button className="bg-slate-300 border hover:bg-slate-200 text-black rounded-md w-[160px]">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </FormProvider>
  );
};
