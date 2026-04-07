import { permissionType } from '../types/roles.type'
import { logger } from '../config/logger'
import prisma from '../config/prisma'
import utils from '../utils/utils'

export const getRoles = async () => {
  try {
    const roles = await prisma.roles.findMany({
      include: {
        permissions: true
      }
    })

    return Promise.resolve({
      msg: 'success',
      data: roles
    })
  } catch (error) {
    logger.error('Cannot get role')
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const addPermission = async (id: string, datas: string[]) => {
  try {
    await findByIdRoles(id)

    const payloadData = datas.map((item) => ({
      name: item,
      role_id: id
    }))

    // Tambahkan permissions dengan relasi ke role_id
    const permissions = await prisma.permissions.createMany({
      data: payloadData,
      skipDuplicates: true // Prevent duplicate permissions
    })

    return {
      message: 'Permissions berhasil ditambahkan',
      count: permissions.count // Number of permissions added
    }
  } catch (error) {
    logger.error('Cannot insert permission')
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const upPermission = async (id: string, datas: string[]) => {
  try {
    // Validate the role ID
    await findByIdRoles(id)

    // delete old permission
    const deletePermission = await prisma.permissions.deleteMany({
      where: {
        role_id: id
      }
    })

    // Update permissions for the given role
    const permissionUpdate = await addPermission(id, datas)

    return permissionUpdate
  } catch (error) {
    logger.error('Cannot update permission')
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const findByIdRoles = async (id: string) => {
  try {
    const roles = await prisma.roles.findUnique({
      where: {
        id
      }
    })

    if (!roles) {
      throw new Error('Roles tidak ditemukan')
    }
    return roles
  } catch (error) {
    logger.error('Cannot get roles')
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}

export const deletePermission = async (id: string) => {
  try {
    // Validate the role ID
    const permissionById = await prisma.permissions.findUnique({
      where: {
        id
      }
    })

    if (!permissionById) {
      throw new Error('Permission tidak ditemukan')
    }

    const deleteData = await prisma.permissions.delete({
      where: {
        id
      }
    })

    return 'success'
  } catch (error: any) {
    logger.error('Cannot delete permission:', error.message)
    const formattedError = utils.formatUnexpectedError(error)
    throw formattedError
  }
}
