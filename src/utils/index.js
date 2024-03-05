import * as yup from "yup";
import { envType } from "../constants";

const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

const pullConfig = {
  logs: "",
  open: false,
  progress: 0,
  completedLayers: 0,
  totalLayers: 0,
};

const createContainerData = (
  id,
  trainID,
  name,
  image,
  state,
  status,
  jobId,
  tag,
  repo
) => {
  return {
    id,
    trainID,
    name,
    image,
    state,
    status,
    jobId,
    tag,
    repo,
    loading: false,
  };
};

const createImageData = (id, trainID, imageTag, status, jobID, labels) => {
  return { id, trainID, imageTag, status, jobID, labels, loading: false };
};

const createData = (id, jobID, trainID, location, pid, current, next) => {
  return { id, jobID, trainID, location, pid, current, next, ...pullConfig };
};

const createDataFL = (
  id,
  learningImage,
  jobID,
  pid,
  currentRound,
  learningRounds,
  trainClassIdLearning,
  verified
) => {
  return {
    id,
    learningImage,
    jobID,
    pid,
    currentRound,
    learningRounds,
    trainClassIdLearning,
    verified,
    ...pullConfig,
  };
};

const createDataFLJobs = (
  id,
  learningImage,
  jobID,
  pid,
  status,
  currentRound,
  totalRounds,
  lastUpdate
) => {
  return {
    id,
    learningImage,
    jobID,
    pid,
    status,
    currentRound,
    totalRounds,
    lastUpdate,
    loading: false,
  };
};

const generateSchemaPayload = (payload) => {
  const strTypes = ["password", "text", "url", "select"];

  return payload.map((config) => {
    let validations = [];

    if (config.required) {
      validations.push({
        type: "required",
        params: ["This field is required"],
      });
    }

    switch (config.type) {
      case envType.NUMBER:
        validations = [
          ...validations,
          { type: "number", params: [] },
          { type: "integer", params: [] },
          { type: "typeError", params: ["Please enter a valid number"] },
        ];
        break;
      case envType.URL:
        validations.push({
          type: "url",
          params: ["Please enter a valid url"],
        });
        break;

      default:
        validations.push({
          type: "string",
          params: [""],
        });
        break;
    }

    return {
      id: config.name,
      validationType: strTypes.includes(config.type) ? "string" : config.type,
      validations,
    };
  });
};

/**
 * Dynamic Schema Creation
 * Credits to: https://github.com/jquense/yup/issues/559#issuecomment-518953000
 */
const createYupSchema = (schema, config) => {
  const { id, validationType, validations = [] } = config;
  if (!yup[validationType]) {
    return schema;
  }
  let validator = yup[validationType]();
  validations.forEach((validation) => {
    const { params, type } = validation;
    if (!validator[type]) {
      return;
    }

    validator = validator[type](...params);
  });
  schema[id] = validator;
  return schema;
};

const getValidationProps = (envs) => {
  const initialFormState = envs?.reduce(
    (acc, { name, value }) => ({ ...acc, [name]: value }),
    {}
  );
  const payload = generateSchemaPayload(envs);
  const FormSchema = yup.object().shape(payload.reduce(createYupSchema, {}));

  return { initialFormState, FormSchema };
};

const updateProgressBar = (pullingFsLayers) => {
  let totalFsLayers = pullingFsLayers.length;
  let totalPercentageCompleted = 0;
  let totalFsLayersCompleted = 0;

  for (let j = 0; j < totalFsLayers; j++) {
    if (pullingFsLayers[j][1][0] === 1) {
      totalFsLayersCompleted++;
    }

    if (pullingFsLayers.length !== totalFsLayersCompleted) {
      if (pullingFsLayers[j][1][1] !== -1) {
        totalPercentageCompleted +=
          (pullingFsLayers[j][1][1] / pullingFsLayers[j][1][2]) * 100;
      }
    }
  }

  /**
   * All fs layers size upto how much completed
   * ((totalCompleted/totalSize)* 100)
   *
   * All fs layers size upto how much completed  / totalFsLayers
   * ((((totalCompleted/totalSize)* 100)/totalFsLayers) * 100)
   */

  const progress = Math.ceil(totalPercentageCompleted / totalFsLayers);
  return { progress, totalFsLayersCompleted, totalFsLayers };
};

export {
  stableSort,
  getComparator,
  createData,
  createDataFL,
  createDataFLJobs,
  createImageData,
  createContainerData,
  getValidationProps,
  updateProgressBar,
};
