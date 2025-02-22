import * as H from '@syndesis/history';
import * as React from 'react';

import { DataShapeKinds, toDataShapeKinds } from '@syndesis/api';
import {
  DataShapeParametersDialog,
  IParameter,
} from '@syndesis/atlasmap-adapter';

import { DataShape } from '@syndesis/models';
import { DescribeDataShapeForm } from '@syndesis/ui';

export interface IWithDescribeDataShapeFormProps {
  initialKind: string;
  initialDefinition?: string;
  initialName?: string;
  initialDescription?: string;
  initialParameters?: {
    [name: string]: string;
  };
  backActionHref: H.LocationDescriptor;
  onUpdatedDataShape: (dataShape: DataShape) => void;
}

export interface IWithDescribeDataShapeFormState {
  kind: string;
  definition?: string;
  name?: string;
  description?: string;
  initialParameters: IParameter[];
  parameters: IParameter[];
  parametersShown: boolean;
  parametersTitle: string;
}

export class WithDescribeDataShapeForm extends React.Component<
  IWithDescribeDataShapeFormProps,
  IWithDescribeDataShapeFormState
> {
  private definition: string | undefined;
  constructor(props: IWithDescribeDataShapeFormProps) {
    super(props);
    this.state = {
      description: this.props.initialDescription,
      initialParameters: [],
      kind: this.props.initialKind,
      name: this.props.initialName,
      parameters: [],
      parametersShown: false,
      parametersTitle: '',
    };
    this.definition = this.props.initialDefinition;
    this.handleDefinitionChange = this.handleDefinitionChange.bind(this);
    this.handleKindChange = this.handleKindChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handleShowParameters = this.handleShowParameters.bind(this);
  }
  public handleKindChange(newKind: string) {
    this.setState({ kind: newKind, parameters: [], initialParameters: [] });
  }
  public handleNameChange(name: string) {
    this.setState({ name });
  }
  public handleDescriptionChange(description: string) {
    this.setState({ description });
  }
  public handleDefinitionChange(definition: string) {
    this.definition = definition;
  }
  public handleNext() {
    const metadata =
      toDataShapeKinds(this.state.kind) === DataShapeKinds.ANY
        ? {}
        : { userDefined: 'true' };
    const dataShape =
      toDataShapeKinds(this.state.kind) === DataShapeKinds.ANY
        ? { kind: this.state.kind }
        : {
            description: this.state.description,
            kind: this.state.kind as any,
            metadata,
            name: this.state.name!,
            parameters: this.state.parameters.reduce((params, param) => {
              params[param.name] = param.value;
              return params;
            }, {}),
            specification: this.definition,
          };
    this.props.onUpdatedDataShape(dataShape as DataShape);
  }

  public handleShowParameters(title: string, initial: IParameter[]) {
    if (this.state.parameters.length === 0) {
      // state.params is empty initially and when the kind changes,
      // non-empty when the user chooses some parameters; so we
      // only set to initial values on the first showing of the
      // dialog for a specific kind
      this.setState({ initialParameters: initial });
    }

    if (this.props.initialParameters) {
      // we were given some initial parameters now we can set them, unfortunately we can't show them
      // the ParametersDialog from AtlasMap doesn't allow this at the moment
      for (const name of Object.keys(this.props.initialParameters!)) {
        const property = initial.find((p) => p.name === name);
        if (property) {
          property!.value = this.props.initialParameters![name];
        }
      }
      this.setState({ initialParameters: initial });
    }

    this.setState({ parametersTitle: title, parametersShown: true });
  }

  public render() {
    return (
      <>
        <DescribeDataShapeForm
          kind={this.state.kind}
          definition={this.definition}
          name={this.state.name}
          description={this.state.description}
          parametersDialog={
            <DataShapeParametersDialog
              title={this.state.parametersTitle}
              shown={this.state.parametersShown}
              parameters={this.state.initialParameters}
              onConfirm={(params: IParameter[]) =>
                this.setState({ parameters: params, parametersShown: false })
              }
              onCancel={() => this.setState({ parametersShown: false })}
            />
          }
          i18nSelectType={'Select Type'}
          i18nSelectTypeHelp={'Indicate how you are specifying the data type.'}
          i18nDataTypeName={'Data Type Name'}
          i18nDataTypeDescription={'Data Type Description'}
          i18nDataTypeDescriptionHelp={
            'Enter any information about this data type that might be helpful to you.'
          }
          i18nDataTypeNameHelp={
            'Enter a name that you choose. This name will appear in the data mapper.'
          }
          i18nDefinition={'Definition'}
          i18nDefinitionHelp={
            'Paste or write content for the type you selected, for example, for JSON Schema, paste the content of a document whose media type is application/schema+json.'
          }
          i18nDataTypeParameters={'Data Type parameters'}
          i18nDataTypeParametersHelp={
            'Specify additional parameters for the data type'
          }
          i18nDataTypeParametersAction={'Parameters'}
          i18nNext={'Next'}
          i18nBackAction={'Back'}
          backActionHref={this.props.backActionHref}
          onNext={this.handleNext}
          onKindChange={this.handleKindChange}
          onNameChange={this.handleNameChange}
          onDescriptionChange={this.handleDescriptionChange}
          onDefinitionChange={this.handleDefinitionChange}
          onShowParameters={this.handleShowParameters}
        />
      </>
    );
  }
}
