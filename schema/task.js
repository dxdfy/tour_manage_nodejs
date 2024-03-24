const joi =require('joi')

const name = joi.string().required()

const reason = joi.string().required()

const id = joi.number().integer().min(1).required()
exports.add_task_schema = {
    body: {
        name,
    }
}

exports.delete_schema = {
    params: {
      id,
    },
  }
  exports.pass_schema = {
    params: {
      id,
    },
  }
  exports.reject_schema = {
    body: {
      Id: id,
      reason: reason,
    },
  }