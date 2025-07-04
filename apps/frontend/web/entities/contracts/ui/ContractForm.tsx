import { IContract } from '@counselflow/types';
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
import { contractToForm } from '@/entities/contracts/model/contractToForm';
import { createContractSchema } from '@/entities/contracts/model/createContractSchema';
import { ContractPrioritySelect } from '@/entities/contracts/ui/ContractPrioritySelect';
import { ContractStatusSelect } from '@/entities/contracts/ui/ContractStatusSelect';
import { ContractTypeSelect } from '@/entities/contracts/ui/ContractTypeSelect';
import MatterSelect from '@/entities/matters/ui/MatterSelect';
import { Button } from '@/shared/ui';
import { DatePicker } from '@/shared/ui/DatePicker';
import { DeleteButton } from '@/shared/ui/DeleteButton';
import { FormErrorMessage } from '@/shared/ui/FormErrorMessage';
import { Input } from '@/shared/ui/Input';
import Label from '@/shared/ui/Label';
import { Textarea } from '@/shared/ui/Textarea';


type ContractFormValues = yup.InferType<typeof createContractSchema>;

interface ContractFormProps {
  defaultValues?: IContract;
  onSubmit: (values: ContractFormValues) => void;
}

export const ContractForm: FC<ContractFormProps> = ({
  defaultValues,
  onSubmit,
}) => {
  const form = useForm<ContractFormValues>({
    resolver: yupResolver(createContractSchema),
    defaultValues: defaultValues ? contractToForm(defaultValues) : {},
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
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
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div>
          <Controller
            name="matterId"
            control={form.control}
            render={({ field }) => (
              <MatterSelect
                field={field}
                label="Matter"
                placeholder="Select Matter"
              />
            )}
          />
          <FormErrorMessage errors={form.formState.errors} name="matterId" />
        </div>
        <div>
          <Controller
            name="owningCompanyId"
            control={form.control}
            render={({ field }) => (
              <CompanySelect
                field={field}
                label="Owning Company"
                placeholder="Select Company"
                required
              />
            )}
          />
          <FormErrorMessage
            errors={form.formState.errors}
            name="owningCompanyId"
          />
        </div>
        <Controller
          name="title"
          control={form.control}
          render={({ field }) => (
            <Input
              label="Title"
              placeholder="Contract Title"
              className="w-full"
              errorMessage={form.formState.errors?.title?.message}
              {...field}
              required
            />
          )}
        />
        <div>
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <ContractTypeSelect field={field} required />
            )}
          />
          <FormErrorMessage errors={form.formState.errors} name="type" />
        </div>
        <div>
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <ContractStatusSelect field={field} required />
            )}
          />
          <FormErrorMessage errors={form.formState.errors} name="status" />
        </div>
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
          <Controller
            name="priority"
            control={form.control}
            render={({ field }) => <ContractPrioritySelect field={field} />}
          />
          <FormErrorMessage errors={form.formState.errors} name="priority" />
        </div>
        <div>
          <Controller
            name="counterpartyId"
            control={form.control}
            render={({ field }) => (
              <CompanySelect
                field={field}
                label="Owning Company"
                placeholder="Select Company"
              />
            )}
          />
          <FormErrorMessage
            errors={form.formState.errors}
            name="counterpartyId"
          />
        </div>
        <Controller
          name="counterpartyName"
          control={form.control}
          render={({ field }) => (
            <Input
              label="Primary Counterparty Name"
              placeholder="Primary Counterparty Name"
              className="w-full"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        <div className="flex flex-col gap-2">
          <Label>Effective Date</Label>
          <Controller
            name="effectiveDate"
            control={form.control}
            render={({ field }) => <DatePicker field={field} />}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Execution Date</Label>
          <Controller
            name="executionDate"
            control={form.control}
            render={({ field }) => <DatePicker field={field} />}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Expiration Date</Label>
          <Controller
            name="expirationDate"
            control={form.control}
            render={({ field }) => <DatePicker field={field} />}
          />
        </div>
        <Controller
          name="valueAmount"
          control={form.control}
          render={({ field }) => (
            <Input
              label="Value Amount"
              placeholder="Value Amount"
              type="number"
              className="w-full"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        <Controller
          name="valueCurrency"
          control={form.control}
          render={({ field }) => (
            <Input
              label="Value Currency"
              placeholder="Value Currency"
              className="w-full"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        <Controller
          name="paymentTerms"
          control={form.control}
          render={({ field }) => (
            <Input
              label="Payment Terms"
              placeholder="Payment Terms"
              className="w-full"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        <Controller
          name="internalLegalOwnerId"
          control={form.control}
          render={({ field }) => (
            <Input
              label="ID of the in-house lawyer/attorney overseeing the contract"
              placeholder="ID of the lawyer/attorney"
              className="w-full"
              {...field}
              value={field.value ?? ''}
            />
          )}
        />
        <Controller
          name="documentId"
          control={form.control}
          render={({ field }) => (
            <Input
              label="Document access"
              placeholder="Document access"
              className="w-full"
              type="number"
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
        <div>
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
        </div>
        <div className="flex justify-center gap-7">
          <Button
            className="border bg-blue-700 text-white rounded-md hover:bg-blue-400 w-[160px]"
            onClick={form.handleSubmit(onSubmit)}
          >
            Save
          </Button>
          <Link to={'/contracts'}>
            <Button className="bg-slate-300 border hover:bg-slate-200 text-black rounded-md w-[160px]">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </FormProvider>
  );
};
