import { IMatter } from '1pd-types';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React, { FC } from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import * as yup from 'yup';

import { CompanySelect } from '@/entities/companies/ui/CompanySelect';
import { createMatterSchema } from '@/entities/matters/model/createMatterSchema';
import { matterToForm } from '@/entities/matters/model/matterToForm';
import { MatterPrioritySelect } from '@/entities/matters/ui/MatterPrioritySelect';
import { MatterStatusSelect } from '@/entities/matters/ui/MatterStatusSelect';
import { MatterTypeSelect } from '@/entities/matters/ui/MatterTypeSelect';
import { RiskSelect } from '@/entities/risks/RiskSelect';
import UsersSelect from '@/entities/user/UsersSelect';
import { Button } from '@/shared/ui';
import { DatePicker } from '@/shared/ui/DatePicker';
import { DeleteButton } from '@/shared/ui/DeleteButton';
import { FormErrorMessage } from '@/shared/ui/FormErrorMessage';
import { Input } from '@/shared/ui/Input';
import { TagsMultiSelect } from '@/shared/ui/TagsMultiSelect';
import { Textarea } from '@/shared/ui/Textarea';


type MatterFormValues = yup.InferType<typeof createMatterSchema>;

interface MatterFormProps {
  defaultValues?: IMatter;
  onSubmit: (values: MatterFormValues) => void;
}

export const MatterForm: FC<MatterFormProps> = ({
  defaultValues,
  onSubmit,
}) => {
  const form = useForm<MatterFormValues>({
    resolver: yupResolver(createMatterSchema),
    defaultValues: defaultValues ? matterToForm(defaultValues) : {},
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'keyDates',
  });

  const handleAddKeyDate = () => {
    append({
      date: '',
      description: '',
    });
  };

  const removeKeyDate = (index: number) => {
    remove(index);
  };

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
              placeholder="Matter Name"
              className="w-full"
              errorMessage={form.formState.errors?.name?.message}
              {...field}
              required
            />
          )}
        />
        <div>
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => <MatterTypeSelect field={field} required />}
          />
          <FormErrorMessage errors={form.formState.errors} name="type" />
        </div>
        <div>
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <MatterStatusSelect field={field} required />
            )}
          />
          <FormErrorMessage errors={form.formState.errors} name="status" />
        </div>
        <div>
          <Controller
            name="priority"
            control={form.control}
            render={({ field }) => (
              <MatterPrioritySelect field={field} required />
            )}
          />
          <FormErrorMessage errors={form.formState.errors} name="priority" />
        </div>
        <div>
          <Controller
            name="companyId"
            control={form.control}
            render={({ field }) => (
              <CompanySelect
                field={field}
                label="Company"
                placeholder="Select company"
                required
              />
            )}
          />
          <FormErrorMessage errors={form.formState.errors} name="companyId" />
        </div>
        <Controller
          name="matterOwnerId"
          control={form.control}
          render={({ field }) => (
            <UsersSelect
              field={field}
              label="Matter Owner"
              placeholder="Matter Owner"
            />
          )}
        />
        <Controller
          name="leadAttorneyId"
          control={form.control}
          render={({ field }) => (
            <UsersSelect
              label="Lead Attorney"
              field={field}
              placeholder="Lead Attorney"
            />
          )}
        />
        <Controller
          name="storageLink"
          control={form.control}
          render={({ field }) => (
            <Input
              label="Storage Link"
              placeholder="Enter Storage Link"
              className="w-full"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        <Controller
          name="riskId"
          control={form.control}
          render={({ field }) => (
            <RiskSelect field={field} label="Risk" placeholder="Risk" />
          )}
        />
        <Controller
          name="tags"
          control={form.control}
          render={({ field }) => <TagsMultiSelect field={field} />}
        />
        <Controller
          name="description"
          control={form.control}
          render={({ field }) => (
            <Textarea
              label="Description"
              className="w-full"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        <div>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-white border-2 rounded-md flex flex-col gap-4 mb-4"
            >
              <div className="py-4 px-4 border-b">KEY DATE {index + 1}</div>
              <div className="flex flex-col gap-4 px-12">
                <div className="flex flex-col gap-4">
                  <Controller
                    name={`keyDates.${index}.date`}
                    control={form.control}
                    render={({ field }) => <DatePicker field={field} />}
                  />
                  <Controller
                    name={`keyDates.${index}.description`}
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        label="Description"
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                </div>
                <div className="flex gap-3 justify-end mb-4">
                  <DeleteButton onButtonClick={() => removeKeyDate(index)} />
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-start my-2">
            <Button
              startIcon={<PlusIcon />}
              className="bg-blue-600 text-white hover:bg-blue-500"
              onClick={handleAddKeyDate}
            >
              Add Key Date
            </Button>
          </div>
        </div>
        <div className="flex justify-center gap-7">
          <Button
            className="border bg-blue-700 text-white rounded-md hover:bg-blue-400 w-[160px]"
            onClick={form.handleSubmit(onSubmit)}
          >
            Save
          </Button>
          <Link to={'/matters'}>
            <Button className="bg-slate-300 border hover:bg-slate-200 text-black rounded-md w-[160px]">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </FormProvider>
  );
};
