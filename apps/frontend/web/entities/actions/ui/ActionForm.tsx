import { IAction } from '1pd-types';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import * as yup from 'yup';

import { actionToForm } from '@/entities/actions/model/actionToForm';
import { createActionSchema } from '@/entities/actions/model/createActionSchema';
import { ActionPrioritySelect } from '@/entities/actions/ui/ActionPrioritySelect';
import { ActionStatusSelect } from '@/entities/actions/ui/ActionStatusSelect';
import { ActionTypeSelect } from '@/entities/actions/ui/ActionTypeSelect';
import MatterSelect from '@/entities/matters/ui/MatterSelect';
import UsersSelect from '@/entities/user/UsersSelect';
import { Button } from '@/shared/ui';
import { Checkbox } from '@/shared/ui/Checkbox';
import { DatePicker } from '@/shared/ui/DatePicker';
import { DeleteButton } from '@/shared/ui/DeleteButton';
import { FormErrorMessage } from '@/shared/ui/FormErrorMessage';
import { Input } from '@/shared/ui/Input';
import Label from '@/shared/ui/Label';
import { Textarea } from '@/shared/ui/Textarea';






interface ActionFormProps {
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: IAction;
}

type ActionFormValues = yup.InferType<typeof createActionSchema>;

export const ActionForm = ({ onSubmit, defaultValues }: ActionFormProps) => {
  const form = useForm<ActionFormValues>({
    resolver: yupResolver(createActionSchema),
    defaultValues: defaultValues ? actionToForm(defaultValues) : {},
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'attachments',
  });

  const handleAddAttachment = () => {
    append({
      name: '',
      path: '',
    });
  };

  const removeAttachment = (index: number) => {
    remove(index);
  };

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div>
          <Controller
            name="matterId"
            control={form.control}
            render={({ field }) => (
              <MatterSelect
                field={field}
                label="Matter"
                placeholder="Select matter"
                required
              />
            )}
          />
          <FormErrorMessage errors={form.formState.errors} name="matterId" />
        </div>
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
        <div>
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => <ActionTypeSelect field={field} required />}
          />
          <FormErrorMessage errors={form.formState.errors} name="type" />
        </div>
        <div>
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <ActionStatusSelect field={field} required />
            )}
          />
          <FormErrorMessage errors={form.formState.errors} name="status" />
        </div>
        <div>
          <Controller
            name="priority"
            control={form.control}
            render={({ field }) => (
              <ActionPrioritySelect field={field} required />
            )}
          />
          <FormErrorMessage errors={form.formState.errors} name="priority" />
        </div>
        <div className="w-full flex flex-col">
          <Label required className="mb-2">
            Start Date
          </Label>
          <Controller
            name="startDate"
            control={form.control}
            render={({ field }) => <DatePicker field={field} />}
          />
          <FormErrorMessage errors={form.formState.errors} name="startDate" />
        </div>
        <div className="w-full flex flex-col">
          <Label required className="mb-2">
            Due Date
          </Label>
          <Controller
            name="dueDate"
            control={form.control}
            render={({ field }) => <DatePicker field={field} />}
          />
          <FormErrorMessage errors={form.formState.errors} name="dueDate" />
        </div>
        <Controller
          name="dependencyIds"
          control={form.control}
          render={({ field }) => (
            <Input
              label="Dependency IDs (comma-separated)"
              className="w-full"
              {...field}
              errorMessage={form.formState.errors?.dependencyIds?.message}
              required
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value ? value.split(',').map(Number) : []);
              }}
            />
          )}
        />
        <div className="flex items-center gap-2">
          <Controller
            name="recurring"
            control={form.control}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label required>Recurring</Label>
        </div>
        <div className="w-full flex flex-col">
          <Label className="mb-2">Completion Date</Label>
          <Controller
            name="completionDate"
            control={form.control}
            render={({ field }) => <DatePicker field={field} />}
          />
        </div>
        <div>
          <Controller
            name="assignedToId"
            control={form.control}
            render={({ field }) => (
              <UsersSelect
                field={field}
                label="Assigned To"
                placeholder="Select user"
              />
            )}
          />
        </div>
        <Controller
          name="recurrencePattern"
          control={form.control}
          render={({ field }) => (
            <Input
              label="Recurrence Pattern"
              className="w-full"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />

        <Controller
          name="notes"
          control={form.control}
          render={({ field }) => (
            <Textarea
              label="Notes"
              className="w-full"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />

        <Controller
          name="parentId"
          control={form.control}
          render={({ field }) => (
            <Input
              label="Parent ID"
              type="number"
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
              <div className="py-4 px-4 border-b">Attachment {index + 1}</div>
              <div className="flex flex-col gap-4 px-12">
                <div className="flex flex-col gap-4">
                  <Controller
                    name={`attachments.${index}.name`}
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        label="Name"
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                  <Controller
                    name={`attachments.${index}.path`}
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        label="Path"
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                </div>
                <div className="flex gap-3 justify-end mb-4">
                  <DeleteButton onButtonClick={() => removeAttachment(index)} />
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-start my-2">
            <Button
              startIcon={<PlusIcon />}
              className="bg-blue-600 text-white hover:bg-blue-500"
              onClick={handleAddAttachment}
            >
              Add Attachment
            </Button>
          </div>
        </div>
        <Controller
          name={`reminderSettings.reminder_offset_days`}
          control={form.control}
          render={({ field }) => (
            <Input
              label="Reminder offset days"
              {...field}
              type="number"
              value={field.value ?? ''}
            />
          )}
        />
        <Controller
          name={`reminderSettings.reminder_type`}
          control={form.control}
          render={({ field }) => (
            <Input label="Reminder Type" {...field} value={field.value ?? ''} />
          )}
        />
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
