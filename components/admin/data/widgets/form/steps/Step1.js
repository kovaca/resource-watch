import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import WidgetEditor, { Renderer } from '@widget-editor/widget-editor';
import RwAdapter from '@widget-editor/rw-adapter';

// Redux
import { connect } from 'react-redux';
import { toastr } from 'react-redux-toastr';

// Constants
import { FORM_ELEMENTS, CONFIG_TEMPLATE, CONFIG_TEMPLATE_OPTIONS } from 'components/admin/data/widgets/form/constants';

// Components
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import TextArea from 'components/form/TextArea';
import Select from 'components/form/SelectInput';
import Code from 'components/form/Code';
import Checkbox from 'components/form/Checkbox';
import SwitchOptions from 'components/ui/SwitchOptions';
import Spinner from 'components/ui/Spinner';

// Utils
import DefaultTheme from 'utils/widgets/theme';

class Step1 extends Component {
  static propTypes = {
    id: PropTypes.string,
    user: PropTypes.object.isRequired,
    form: PropTypes.object,
    mode: PropTypes.string,
    datasets: PropTypes.array,
    onChange: PropTypes.func,
    onModeChange: PropTypes.func,
    showEditor: PropTypes.bool,
    onGetWidgetConfig: PropTypes.func,
    query: PropTypes.object.isRequired
  };

  static defaultProps = { showEditor: true }

  state = {
    id: this.props.id,
    form: this.props.form,
    loadingVegaChart: false
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      form: {
        ...nextProps.form,
        dataset: nextProps.form.dataset || nextProps.query.dataset
      }
    });
  }

  /**
   * HELPERS
   * - triggerChangeMode
  */
  triggerChangeMode = (mode) => {
    if (mode === 'editor') {
      toastr.confirm('By switching you will start editing from scratch', {
        onOk: () => {
          this.props.onModeChange(mode);
        },
        onCancel: () => {
          this.props.onModeChange(this.props.mode);
        }
      });
    } else {
      toastr.confirm('By switching you can edit your current widget but you can\'t go back to the editor', {
        onOk: () => {
          this.props.onModeChange(mode);
        },
        onCancel: () => {
          this.props.onModeChange(this.props.mode);
        }
      });
    }
  }

  triggerToggleLoadingVegaChart = (loading) => {
    this.setState({ loadingVegaChart: loading });
  }

  refreshWidgetPreview = () => {
    this.forceChartUpdate();
  }

  render() {
    const { id, loadingVegaChart } = this.state;
    const { user, showEditor, query } = this.props;

    // Reset FORM_ELEMENTS
    FORM_ELEMENTS.elements = {};

    const editorFieldContainerClass = classnames({ '-expanded': this.props.mode === 'editor' });
    const widgetTypeEmbed = this.state.form.widgetConfig.type === 'embed';

    return (
      <fieldset className="c-field-container">
        <fieldset className="c-field-container">
          {/* DATASET */}
          <Field
            ref={(c) => { if (c) FORM_ELEMENTS.elements.dataset = c; }}
            onChange={value => this.props.onChange({
              dataset: value,
              widgetConfig: {}
            })}
            validations={['required']}
            className="-fluid"
            options={this.props.datasets}
            properties={{
              name: 'dataset',
              label: 'Dataset',
              default: query.dataset,
              value: this.state.form.dataset || query.dataset,
              disabled: !!id,
              required: true,
              instanceId: 'selectDataset'
            }}
          >
            {Select}
          </Field>

          {/* NAME */}
          <Field
            ref={(c) => { if (c) FORM_ELEMENTS.elements.name = c; }}
            onChange={value => this.props.onChange({ name: value })}
            validations={['required']}
            className="-fluid"
            properties={{
              name: 'name',
              label: 'Name',
              type: 'text',
              required: true,
              default: this.state.form.name,
              value: this.state.form.name
            }}
          >
            {Input}
          </Field>

          {/* DESCRIPTION */}
          <Field
            ref={(c) => { if (c) FORM_ELEMENTS.elements.description = c; }}
            onChange={value => this.props.onChange({ description: value })}
            className="-fluid"
            properties={{
              name: 'description',
              label: 'Description',
              default: this.state.form.description
            }}
          >
            {TextArea}
          </Field>

          {(user.role === 'ADMIN') &&
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.env = c; }}
              hint={'Choose "preproduction" to see this dataset it only as admin, "production" option will show it in public site.'}
              className="-fluid"
              options={[{ label: 'Pre-production', value: 'preproduction' }, { label: 'Production', value: 'production' }]}
              onChange={value => this.props.onChange({ env: value })}
              properties={{
                name: 'env',
                label: 'Environment',
                placeholder: 'Type the columns...',
                noResultsText: 'Please, type the name of the columns and press enter',
                promptTextCreator: label => `The name of the column is "${label}"`,
                default: 'preproduction',
                value: this.props.form.env
              }}
            >
              {Select}
            </Field>}

          {/* PUBLISHED */}
          <Field
            ref={(c) => { if (c) FORM_ELEMENTS.elements.published = c; }}
            onChange={value => this.props.onChange({ published: value.checked })}
            properties={{
              name: 'published',
              label: 'Do you want to set this widget as published?',
              value: 'published',
              title: 'Published',
              checked: this.props.form.published
            }}
          >
            {Checkbox}
          </Field>

          {/* DEFAULT */}
          <Field
            ref={(c) => { if (c) FORM_ELEMENTS.elements.default = c; }}
            onChange={value => this.props.onChange({ default: value.checked })}
            properties={{
              name: 'default',
              label: 'Do you want to set this widget as default?',
              value: 'default',
              title: 'Default',
              checked: this.props.form.default
            }}
          >
            {Checkbox}
          </Field>

          {/* DEFAULT EDITABLE WIDGET */}
          <Field
            ref={(c) => { if (c) FORM_ELEMENTS.elements.defaultEditableWidget = c; }}
            onChange={value => this.props.onChange({ defaultEditableWidget: value.checked })}
            properties={{
              name: 'defaultEditableWidget',
              label: 'Do you want to set this widget as the default editable widget?',
              value: 'defaultEditableWidget',
              title: 'Default editable widget',
              checked: this.props.form.defaultEditableWidget
            }}
          >
            {Checkbox}
          </Field>

          {/* FREEZE */}
          <div className="freeze-container">
            <Field
              ref={(c) => { if (c) FORM_ELEMENTS.elements.freeze = c; }}
              onChange={value => this.props.onChange({ freeze: value.checked })}
              properties={{
                name: 'freeze',
                label: this.props.id ? '' : 'Do you want to freeze this widget?',
                value: 'freeze',
                title: 'Freeze',
                checked: this.props.form.freeze
              }}
            >
              {Checkbox}
            </Field>
            {this.props.form.freeze && this.props.id &&
              <div className="freeze-text">
                This widget has been <strong>frozen</strong> and cannot be modified...
              </div>
            }
          </div>
        </fieldset>

        {this.state.form.dataset && showEditor &&
          <fieldset className={`c-field-container ${editorFieldContainerClass}`}>
            <div className="l-row row align-right">
              <div className="column shrink">
                <SwitchOptions
                  selected={this.props.mode}
                  options={[{
                    value: 'advanced',
                    label: 'Advanced'
                  }, {
                    value: 'editor',
                    label: 'Editor'
                  }]}
                  onChange={selected => this.triggerChangeMode(selected.value)}
                />
              </div>
            </div>

            {this.props.mode === 'editor' &&
              <WidgetEditor 
                datasetId={this.state.form.dataset}
                widgetId={this.props.id}
                application="rw"
                onSave={this.props.onGetWidgetConfig}
                theme={DefaultTheme}
                adapter={RwAdapter}
              />
              // <WidgetEditor
              //   datasetId={this.state.form.dataset}
              //   widgetId={this.props.id}
              //   saveButtonMode="never"
              //   embedButtonMode="never"
              //   titleMode="never"
              //   provideWidgetConfig={this.props.onGetWidgetConfig}
              // />
            }

            {this.props.mode === 'advanced' &&
              <Field
                onChange={value => this.props.onChange({ widgetConfig: CONFIG_TEMPLATE[value] || {} })}
                options={CONFIG_TEMPLATE_OPTIONS}
                properties={{
                  name: 'template',
                  label: 'Template',
                  instanceId: 'selectTemplate'
                }}
              >
                {Select}
              </Field>
            }

            {this.props.mode === 'advanced' &&
              <div className="advanced-mode-container">
                <Field
                  ref={(c) => { if (c) FORM_ELEMENTS.elements.widgetConfig = c; }}
                  onChange={value => this.props.onChange({ widgetConfig: value })}
                  properties={{
                    name: 'widgetConfig',
                    label: 'Widget config',
                    default: this.state.form.widgetConfig,
                    value: this.state.form.widgetConfig
                  }}
                >
                  {Code}
                </Field>
                <div className="c-field vega-preview">
                  <h5>Widget preview</h5>
                  {!widgetTypeEmbed &&
                    <div className="">
                      <Spinner isLoading={loadingVegaChart} className="-light -relative" />
                      {this.state.form.widgetConfig && this.state.form.widgetConfig.data && (
                        <Renderer
                          widgetConfig={this.state.form.widgetConfig}
                        />
                      )}
                      <div className="actions">
                        <button
                          type="button"
                          className="c-button -primary"
                          onClick={this.refreshWidgetPreview}
                        >
                            Refresh
                        </button>
                      </div>
                    </div>
                  }
                  {widgetTypeEmbed &&
                    <iframe src={this.state.form.widgetConfig.url} width="100%" height="100%" frameBorder="0" />
                  }
                </div>
              </div>
            }

          </fieldset>
        }
        {!showEditor && this.state.form.dataset &&
          <div>
            <Spinner isLoading={loadingVegaChart} className="-light -relative" />
            <VegaChart
              data={this.state.form.widgetConfig}
              theme={defaultTheme}
              showLegend
              reloadOnResize
              toggleLoading={this.triggerToggleLoadingVegaChart}
            />
          </div>
        }
      </fieldset>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  query: state.routes.query
});

export default connect(mapStateToProps, null)(Step1);
