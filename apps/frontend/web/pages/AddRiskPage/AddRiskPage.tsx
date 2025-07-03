import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { useCreateRisk } from '@/entities/risks/hooks/useCreateRisk';
import { Button } from '@/shared/ui';
import { Input } from '@/shared/ui/Input';
import { Text } from '@/shared/ui/Text';
import { Textarea } from '@/shared/ui/Textarea';
import Layout from '@/widgets/layout/Layout';

const AddRiskPage = () => {
    const { mutateAsync } = useCreateRisk();
    const form = useForm<any>();

    const onSubmit = async (data: any) => {
      await mutateAsync(data);
    };

    return (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Layout>
            <div className="p-6 flex flex-col gap-6 justify-center">
              <Text variant="heading">Create New Risk</Text>
              <Controller
                name="name"
                control={form.control}
                render={({ field }) => (
                  <Input
                    label="Name"
                    className="w-full"
                    {...field}
                    required
                  />
                )}
              />
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
              <Button
                className="border bg-blue-500 text-white rounded-md hover:bg-blue-200 w-[140px]"
                onClick={form.handleSubmit(onSubmit)}
              >
                Create
              </Button>
            </div>
          </Layout>
        </form>
      </FormProvider>
    );
  }
;

export default AddRiskPage;