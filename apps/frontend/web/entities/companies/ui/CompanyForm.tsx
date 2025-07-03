import { ICompany } from '1pd-types';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from '@tanstack/react-router';
import React, { FC } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';



import { companyToForm } from '@/entities/companies/model/companyToForm';
import { createCompanySchema } from '@/entities/companies/model/createCompanySchema';
import { CompanyMultiSelect } from '@/entities/companies/ui/CompanyMultiSelect';
import { CompanySelect } from '@/entities/companies/ui/CompanySelect';
import { Button } from '@/shared/ui';
import { FormErrorMessage } from '@/shared/ui/FormErrorMessage';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';

type CompanyFormValues = yup.InferType<typeof createCompanySchema>;

interface CompanyFormProps {
  defaultValues?: ICompany;
  onSubmit: (values: CompanyFormValues) => void;
}

export const CompanyForm: FC<CompanyFormProps> = ({
  defaultValues,
  onSubmit,
}) => {
  const form = useForm<CompanyFormValues>({
    resolver: yupResolver(createCompanySchema),
    defaultValues: defaultValues ? companyToForm(defaultValues) : {},
    mode: 'onChange',
  });

  /*  const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: 'partiesInvolved',
    });
  
    const handleAddCompany = () => {
      append({
        companyId: '',
        role: '',
        signatory: '',
      });
    };
  
    const removeCompany = (index: number) => {
      remove(index);
    };*/

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <Controller
          name="name"
          control={form.control}
          render={({ field }) => (
            <Input
              label="Name"
              {...field}
              value={field.value ?? ''}
              errorMessage={form.formState.errors?.name?.message}
              required
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
                {...field}
                value={field.value ?? ''}
              />
            )}
          />
          <FormErrorMessage errors={form.formState.errors} name="description" />
        </div>
        <div>
          <Controller
            name="parentId"
            control={form.control}
            render={({ field }) => (
              <CompanySelect
                field={field}
                label="Parent"
                placeholder="Select Company"
              />
            )}
          />
          <FormErrorMessage errors={form.formState.errors} name="type" />
        </div>
        <div>
          <Controller
            name="childrenIds"
            control={form.control}
            render={({ field }) => (
              <CompanyMultiSelect
                field={field}
                label="Children Companies"
                className="w-full"
              />
            )}
          />
          <FormErrorMessage errors={form.formState.errors} name="childrenIds" />
        </div>
        {/*<div>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-white border-2 rounded-md flex flex-col gap-4 mb-4"
            >
              <div className="py-4 px-4 border-b">Company {index + 1}</div>
              <div className="flex flex-col gap-4 px-12">
                <div className="flex flex-col gap-4">
                  <Controller
                    name={`partiesInvolved.${index}.companyId`}
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        label="Company ID"
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                  <Controller
                    name={`partiesInvolved.${index}.role`}
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        label="Role"
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                  <Controller
                    name={`partiesInvolved.${index}.signatory`}
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        label="Signatory"
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                </div>
                <div className="flex gap-3 justify-end mb-4">
                  <DeleteButton onButtonClick={() => removeCompany(index)} />
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-start my-2">
            <Button
              startIcon={<PlusIcon />}
              className="bg-blue-600 text-white hover:bg-blue-500"
              onClick={handleAddCompany}
            >
              Add Company
            </Button>
          </div>
        </div>*/}
        <div className="flex justify-center gap-7">
          <Button
            className="border bg-blue-700 text-white rounded-md hover:bg-blue-400 w-[160px]"
            onClick={form.handleSubmit(onSubmit)}
          >
            Save
          </Button>
          <Link to={'/companies'}>
            <Button className="bg-slate-300 border hover:bg-slate-200 text-black rounded-md w-[160px]">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </FormProvider>
  );
};
