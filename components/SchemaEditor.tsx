import React, { useState, useEffect } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CopyIcon } from './icons/CopyIcon';
import Tooltip from './Tooltip';
import TooltipWrapper from './TooltipWrapper';

type FieldType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date';

interface SchemaField {
  id: string;
  name: string;
  type: FieldType;
}

interface SchemaEditorProps {
  initialJsonString: string;
}

export const SchemaEditor: React.FC<SchemaEditorProps> = ({ initialJsonString }) => {
  const [fields, setFields] = useState<SchemaField[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const schemaObj = JSON.parse(initialJsonString);
      if (typeof schemaObj !== 'object' || schemaObj === null) {
          throw new Error('Invalid schema format');
      }
      const initialFields = Object.entries(schemaObj).map(([name, type], index) => ({
        id: `field-${index}-${Date.now()}`,
        name,
        type: type as FieldType,
      }));
      setFields(initialFields);
    } catch (e) {
      console.error("Failed to parse initial schema JSON:", e);
      setFields([]); // Fallback to an empty editor on error
    }
  }, [initialJsonString]);

  const handleFieldChange = (id: string, key: 'name' | 'type', value: string) => {
    setFields(currentFields =>
      currentFields.map(field =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  const addField = () => {
    const newField: SchemaField = {
      id: `field-new-${Date.now()}`,
      name: 'new_field',
      type: 'string',
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const handleCopy = () => {
    const schemaJson = fields.reduce((acc, field) => {
      if (field.name.trim()) {
        acc[field.name.trim()] = field.type;
      }
      return acc;
    }, {} as Record<string, FieldType>);

    navigator.clipboard.writeText(JSON.stringify(schemaJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
         <h4 className="text-md font-semibold text-gray-700 flex items-center">
            <span>Interactive Schema Editor</span>
            <Tooltip text="A schema defines the structure of your final dataset. Define the fields (columns) you want to extract and their corresponding data types (e.g., `string` for text, `number` for integers). You can add, remove, and edit fields here before copying the final JSON structure." />
         </h4>
        <TooltipWrapper tooltipText="Copies the current schema structure to your clipboard as a formatted JSON object.">
          <button
              onClick={handleCopy}
              className="flex items-center text-sm px-3 py-1.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-cyan-500 transition-colors duration-300"
          >
              <CopyIcon className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy as JSON'}
          </button>
        </TooltipWrapper>
      </div>
     
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-6">
              <div className="flex items-center w-full">
                <input
                  type="text"
                  value={field.name}
                  onChange={e => handleFieldChange(field.id, 'name', e.target.value)}
                  placeholder="Field Name"
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                />
                {index === 0 && <Tooltip text="The name of the data column (e.g., 'product_name', 'user_id')." />}
              </div>
            </div>
            <div className="col-span-5">
              <div className="flex items-center w-full">
                <select
                  value={field.type}
                  onChange={e => handleFieldChange(field.id, 'type', e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm"
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="object">object</option>
                  <option value="array">array</option>
                  <option value="date">date</option>
                </select>
                {index === 0 && <Tooltip text="The expected data type for this field (e.g., 'string' for text, 'number' for integers)." />}
              </div>
            </div>
            <div className="col-span-1 flex justify-center">
              <TooltipWrapper tooltipText="Removes this field from the schema.">
                <button onClick={() => removeField(field.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </TooltipWrapper>
            </div>
          </div>
        ))}
      </div>
       <TooltipWrapper tooltipText="Adds a new, empty row to the schema for you to define another field.">
        <button
          onClick={addField}
          className="mt-4 flex items-center w-full justify-center text-sm px-4 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-md hover:bg-cyan-50 hover:border-cyan-400 hover:text-cyan-600 transition-colors duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Field
        </button>
      </TooltipWrapper>
    </div>
  );
};
