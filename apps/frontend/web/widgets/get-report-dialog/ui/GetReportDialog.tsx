import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/DIalog';
import { Button } from '@/shared/ui';
import React from 'react';
import MatterSelect from '@/entities/matters/ui/MatterSelect';
import { Controller, FormProvider, useForm } from 'react-hook-form';

export const GetReportDialog = () => {
  const form = useForm<any>();

  const onSubmit = async (data: any) => {
    console.log('data', data);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="submit"
          className="bg-teal-900 text-white hover:bg-teal-700 mt-4 px-10"
        >
          Next ...
        </Button>
      </DialogTrigger>
      <FormProvider {...form}>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <DialogContent hideCloseButton className="sm:max-w-[425px] p-0">
            <DialogHeader className="bg-teal-900 p-4">
              <DialogTitle className="font-bold text-white">
                Single Matter Report
              </DialogTitle>
            </DialogHeader>
            <div className="px-4">
              <Controller
                name="matter"
                control={form.control}
                render={({ field }) => (
                  <MatterSelect
                    field={field}
                    label="Please select a matter"
                    placeholder="Select .."
                  />
                )}
              />
            </div>
            <DialogFooter className="p-4">
              <Button
                type="submit"
                className="bg-teal-900 text-white hover:bg-teal-700 mt-4 px-10"
                onClick={form.handleSubmit(onSubmit)}
              >
                Get report
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </FormProvider>
    </Dialog>
  );
};
