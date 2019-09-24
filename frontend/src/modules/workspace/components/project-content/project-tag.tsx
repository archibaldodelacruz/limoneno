import * as React from 'react';
import './project-tag.scss';
import 'antd/dist/antd.css';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import {
  Breadcrumb,
  Icon,
  Tag,
  Table,
  Spin,
  Button,
  message,
  Modal,
  Empty,
  Tooltip
} from 'antd';
import { getWorkout } from '../../../../actions/doclasifications';
import { Clasification } from '../../../../models/clasification';
import { Entity } from '../../../../models/entity';
import { DatasetItemTag } from '../../../../models/dataset-item-tag';
import { Taggy } from '../../shared/taggy/taggy';
import ClasificationService from '../../../../services/clasification/clasification.service';
import { ProjectDatasetItem } from '../../../../models/project-dataset-item';
import { Subclasification } from '../../../../models/subclasification';

declare var window: any;
declare var document: any;

export class ProjectTagComponent extends React.Component<any> {
  // Define the props in component
  props: any;

  // Define state vasriable
  state: any = {
    project: null,
    workout: null,
    tmp_start: null,
    tmp_end: null,
    entities: [],
    saving: false
  };

  componentDidMount() {
    this.props.getWorkout(this.props.match.params.id);
    document.onselectionchange = () => {
      let selection = window.getSelection();
      if (this.state.workout) {
        try {
          let text = this.state.workout.datasetItem.text;
          let parent = selection.focusNode.parentNode.parentNode;
          let parentMax = selection.focusNode.parentNode.parentNode.parentNode;
          if (
            parent.className === 'dataset__text' ||
            parentMax.className === 'dataset__text'
          ) {
            if (
              text.indexOf(selection.toString()) ===
              text.lastIndexOf(selection.toString())
            ) {
              this.setState({
                tmp_start: text.indexOf(selection.toString()),
                tmp_end:
                  text.indexOf(selection.toString()) +
                  selection.toString().length
              });
            } else {
              let value = selection.baseNode.nodeValue;
              let offset = this.state.workout.datasetItem.text.indexOf(value);

              if (selection.anchorOffset < selection.focusOffset) {
                this.setState({
                  tmp_start: selection.anchorOffset + offset,
                  tmp_end: selection.focusOffset + offset
                });
              } else {
                this.setState({
                  tmp_start: selection.focusOffset + offset,
                  tmp_end: selection.anchorOffset + offset
                });
              }
            }
          }
        } catch (e) {
          message.error(e);
        }
      }
    };
  }

  getColor(key: number): string {
    if (key === 0) return 'magenta';
    if (key === 1) return 'red';
    if (key === 2) return 'volcano';
    if (key === 3) return 'orange';
    if (key === 4) return 'gold';
    if (key === 5) return 'lime';
    if (key === 6) return 'green';
    if (key === 7) return 'cyan';
    if (key === 8) return 'blue';
    if (key === 9) return 'geekblue';
    if (key === 10) return 'purple';
    return '#' + ((Math.random() * 0xffffff) << 0).toString(16);
  }

  setClasification(clasification: Clasification): void {
    const editedWorkout = { ...this.state.workout, clasification };

    this.setState({
      workout: editedWorkout
    });
  }

  setSubclasification(subclasification: Subclasification): void {
    const { workout } = this.state;
    const clasification = { ...workout.clasification, subclasification };
    const editedWorkout = { ...workout, clasification };

    this.setState({
      workout: editedWorkout
    });
  }

  clasificationColor(checkingClasification: Clasification): string {
    const { clasification } = this.state.workout;

    if (!clasification) return '';
    if (checkingClasification.name === clasification.name) {
      return 'active';
    }
    return '';
  }

  subclasificationColor(checkingSubclasification: Subclasification): string {
    const {
      clasification: { subclasification }
    } = this.state.workout;

    if (subclasification) return '';
    if (checkingSubclasification.name === subclasification.name) {
      return 'active';
    }
    return '';
  }

  checkClasification(): any {
    if (!this.state.workout.clasification) return null;

    return (
      <Icon
        type="check-circle"
        theme="twoTone"
        twoToneColor="#52c41a"
        className="space_icon"
      />
    );
  }

  checkSubclasification(): any {
    if (
      this.state.workout.clasification &&
      this.state.workout.clasification.subclasification
    ) {
      return (
        <Icon
          type="check-circle"
          theme="twoTone"
          twoToneColor="#52c41a"
          className="space_icon"
        />
      );
    }
  }

  checkEntities(): any {
    if (this.state.workout.tags.length > 0) {
      return (
        <Icon
          type="check-circle"
          theme="twoTone"
          twoToneColor="#52c41a"
          className="space_icon"
        />
      );
    }
  }

  showSubclasification(): any {
    if (
      this.state.workout.clasification &&
      this.state.workout.clasification.subclasifications &&
      this.state.workout.clasification.subclasifications.length > 0
    ) {
      return (
        <div className="subclasification">
          <div className="sublabel">
            <Icon type="tag" /> Subclasificación del documento
            {this.checkSubclasification()}
          </div>
          <div className="text">¿A que subclasificación corresponde?</div>
          <div className="options">
            {this.state.workout.clasification.subclasifications.map(
              (subclasification: Subclasification, index: number) => {
                return (
                  <Tooltip
                    placement="top"
                    title={subclasification.description}
                    key={index}
                  >
                    <Tag
                      color={this.getColor(index)}
                      onClick={this.setSubclasification.bind(
                        this,
                        subclasification
                      )}
                      className={this.subclasificationColor(subclasification)}
                    >
                      {subclasification.name}
                    </Tag>
                  </Tooltip>
                );
              }
            )}
          </div>
        </div>
      );
    }
  }

  getClasification(): any {
    if (this.state.project) {
      let type = this.state.project.clasification_type;
      if (type === 3 || type === 1) {
        return (
          <div className="clasification">
            <div className="label">
              <Icon type="tag" /> Clasificación del documento
              {this.checkClasification()}
            </div>
            <div className="text">¿A que documento corresponde?</div>
            <div className="options">
              {this.state.project.clasifications.map(
                (clasification: Clasification, index: number) => {
                  return (
                    <Tooltip
                      placement="top"
                      title={clasification.description}
                      key={index}
                    >
                      <Tag
                        color={this.getColor(index)}
                        onClick={this.setClasification.bind(
                          this,
                          clasification
                        )}
                        className={this.clasificationColor(clasification)}
                      >
                        {clasification.name}
                      </Tag>
                    </Tooltip>
                  );
                }
              )}
            </div>
            {this.showSubclasification()}
          </div>
        );
      }
    }
  }

  tag(entity: Entity, document: boolean): void {
    if (this.state.tmp_start !== null && this.state.tmp_end) {
      let workout = this.state.workout;
      workout.documents = document;
      workout.tags.push(
        new DatasetItemTag({
          start: this.state.tmp_start,
          end: this.state.tmp_end,
          type: entity.tag,
          label: entity.name
        })
      );

      this.setState({
        tmp_start: null,
        tmp_end: null,
        workout: workout
      });
    } else {
      message.warning('Debe seleccionar una fragmento de texto');
    }
  }

  getEntities(): any {
    if (this.state.project && !this.state.workout.documents) {
      let type = this.state.project.clasification_type;
      if (type === 3 || type === 2) {
        return (
          <div className="labels">
            <div className="label">
              <Icon type="highlight" /> Identificador de entidades
              {this.checkEntities()}
            </div>
            <div className="text">
              Selecciona un trozo de texto y identificalo
            </div>
            <div className="options">
              {this.state.project.entities.map(
                (entity: Entity, index: number) => {
                  return (
                    <Tooltip
                      placement="top"
                      title={entity.description}
                      key={index}
                    >
                      <Tag
                        color={this.getColor(index)}
                        onClick={this.tag.bind(this, entity, false)}
                      >
                        {entity.name}
                      </Tag>
                    </Tooltip>
                  );
                }
              )}
            </div>
          </div>
        );
      }
    }
  }

  getEntitiesCat(): any {
    const {
      workout: { documents, tags },
      project: { entities }
    } = this.state;

    if (documents) {
      return tags.map((tag: DatasetItemTag, index: number) => {
        return {
          type: tag.label,
          label: tag.label,
          color: this.getColor(index)
        };
      });
    }

    return entities.map((entity: Entity, index: number) => {
      return {
        type: entity.tag,
        label: entity.name,
        color: this.getColor(index)
      };
    });
  }

  getDocumentSeparator(): any {
    const { documents, tags } = this.state.workout;

    if ((!documents && !(tags && tags.length > 0)) || documents) {
      return (
        <div className="separator">
          <div className="label">
            <Icon type="highlight" /> Separador de documentos
          </div>
          <div className="text">
            Selecciona un trozo de texto y identificalo
          </div>
          <Button
            type="primary"
            className="separator__button"
            onClick={this.tag.bind(
              this,
              new Entity({
                tag: `Document ${tags.length + 1}`,
                name: `Document ${tags.length + 1}`
              }),
              true
            )}
          >
            <Icon type="file-text"></Icon> Separar Documento
          </Button>
        </div>
      );
    }
  }

  getSidebar(): any {
    return (
      <div className="sidebar">
        <div className="title">
          <Icon type="tool" /> Panel de herramientas
        </div>
        {this.getClasification()}
        {this.getEntities()}
        {this.getDocumentSeparator()}
      </div>
    );
  }

  getMetadata(): any {
    return (
      <div className="dataset__metadata">
        <Table
          dataSource={this.state.workout.datasetItem.metadata}
          className="metadata__table"
        >
          <Table.Column title="Llave" dataIndex="key" key="key" />
          <Table.Column title="Valor" dataIndex="value" key="email" />
        </Table>
      </div>
    );
  }

  save = (): any => {
    const {
      workout: {
        clasification,
        clasification: { subclasifications, subclasification },
        documents,
        tags
      }
    } = this.state;
    let type = this.state.project.clasification_type;

    if (type === 3 || type === 1) {
      if (!clasification) {
        message.warning(
          'Debe identificar la clasificación del texto antes de guardar'
        );
        return;
      }

      if (subclasifications && !subclasification) {
        message.warning(
          'Debe identificar la subclasificación del texto antes de guardar'
        );
        return;
      }
    }

    if (!documents && (type === 3 || type === 2)) {
      if (tags.length === 0) {
        message.warning(
          'Debe identificar al menos una entidad dentro del texto'
        );
        return;
      }
    }

    const editedTags = tags.map((tag: DatasetItemTag) => {
      delete tag.label;
      tag.type = documents ? tag.type : 'Document';
      return tag;
    });
    const editedWorkout = { ...this.state.workout, tags: editedTags };

    this.setState({
      saving: true,
      workout: editedWorkout
    });

    ClasificationService.getInstance()
      .updateWorkout(this.state.project, editedWorkout)
      .subscribe(
        (data: ProjectDatasetItem) => {
          this.setState({
            saving: false
          });

          Modal.confirm({
            title: 'Confirmación?',
            content: 'Trabajo guardado, ¿Desea continuar con el siguiente?',
            onOk: () => {
              this.setState({
                project: null,
                workout: null,
                tmp_start: null,
                tmp_end: null,
                entities: [],
                saving: false
              });
              this.props.getWorkout(this.props.match.params.id);
            },
            onCancel: () => {
              this.props.history.push('/workspace');
            }
          });
        },
        error => {
          console.log(error);
        }
      );
  };

  deleteTag(tag: any): void {
    let target = this.state.workout.tags.find((item: any) => {
      return (
        tag.start === item.start &&
        tag.end === item.end &&
        tag.type === item.type
      );
    });
    let workout = this.state.workout;
    workout.tags.splice(this.state.workout.tags.indexOf(target));
    // Clean if no have more tags
    if (workout.tags.length === 0) {
      workout.documents = false;
    }
    this.setState({
      workout: workout
    });
  }

  getWorkout(): any {
    if (this.state.project && this.state.workout) {
      return (
        <div className="clasificator">
          {this.getSidebar()}
          <div className="dataset__item">
            <div className="label">
              <Icon type="file-text" /> Texto a identificar.
            </div>
            <div className="text">
              Este texto debe ser identificado en base a la clasificación del
              texto o la identificacion de sus correspondientes entidades.
            </div>
            <div className="dataset__text">
              <Taggy
                className="tags"
                text={this.state.workout.datasetItem.text}
                ents={this.getEntitiesCat()}
                spans={this.state.workout.tags}
                delete={this.deleteTag.bind(this)}
              />
            </div>
            <div className="label">
              <Icon type="build" /> Metadata del texto.
            </div>
            <div className="text">
              Esta información de llaves par valor corresponde a la metadata que
              acompañaba al archivo al momento de ser ingresado para su
              identificación.
            </div>
            {this.getMetadata()}
          </div>
        </div>
      );
    } else if (this.props.noWorkouts) {
      return (
        <div className="empty">
          <Empty
            description={
              <span>No hay trabajos disponibles en este proyecto</span>
            }
          />
        </div>
      );
    } else {
      return (
        <div className="empty">
          <Spin size="large" />
          <div>Cargando trabajo</div>
        </div>
      );
    }
  }

  static getDerivedStateFromProps(props: any, state: any) {
    state.project = props.project;
    state.workout = props.workout;
    return state;
  }

  render() {
    const {
      id,
      project: { name },
      noWorkouts
    } = this.props;

    return (
      <div className="workout">
        <div className="top">
          <Breadcrumb className="breadcum">
            <Breadcrumb.Item>Limoneno</Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/workspace">Espacio de trabajo</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/projects/${id}`}>{name ? name : ''}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Clasificación</Breadcrumb.Item>
          </Breadcrumb>
          <div className="buttons">
            <Link to="/workspace">
              <Button type="danger">
                <Icon type="close" /> Volver
              </Button>
            </Link>
            <Button
              type="primary"
              onClick={this.save}
              loading={this.state.saving}
              disabled={noWorkouts}
            >
              <Icon type="save" /> Enviar solución
            </Button>
          </div>
        </div>
        <div className="workout__content">{this.getWorkout()}</div>
      </div>
    );
  }
}

// Configure React-redux store functions
function mapStateToProps(state: any) {
  return {
    project: state.project.project,
    workout: state.clasification.workout,
    noWorkouts: state.clasification.noWorkouts
  };
}

function matchDispatchToProps(dispatch: any) {
  return bindActionCreators(
    {
      getWorkout
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  matchDispatchToProps
)(withRouter(ProjectTagComponent));
