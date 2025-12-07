const asyncHandler = (requstHandler) => {
    (req, res, next) => {
        Promise.resolve(requstHandler(req, res, next)).
            catch((err) => next(err))
    }
}



export { asyncHandler }

// const asyncHandler = (e) => async (req, res, next) => {
//     try {
//         await e(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             sucess: false,
//             message: err.message
//         })
//     }
// }