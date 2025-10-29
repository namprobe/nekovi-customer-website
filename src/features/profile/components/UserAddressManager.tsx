"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { useToast } from "@/src/hooks/use-toast"
import { useUserAddressStore } from "@/src/entities/user-address/service"
import { 
  AddressTypeEnum, 
  EntityStatusEnum,
  type UserAddressRequest,
  type UserAddressItem 
} from "@/src/entities/user-address/type/user-address"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { MapPin, Phone, Pencil, Trash2, Plus, Loader2 } from "lucide-react"

export function UserAddressManager() {
  const { toast } = useToast()
  const { 
    addresses, 
    isLoading, 
    fetchAddresses,
    fetchAddressById, 
    createAddress, 
    updateAddress, 
    deleteAddress 
  } = useUserAddressStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddressItem | null>(null)
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<UserAddressRequest>({
    addressType: AddressTypeEnum.Home,
    fullName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Vietnam",
    isDefault: false,
    phoneNumber: "",
    status: EntityStatusEnum.Active,
  })

  useEffect(() => {
    fetchAddresses({ isCurrentUser: true })
  }, [fetchAddresses])

  const resetForm = () => {
    setFormData({
      addressType: AddressTypeEnum.Home,
      fullName: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Vietnam",
      isDefault: false,
      phoneNumber: "",
      status: EntityStatusEnum.Active,
    })
    setEditingAddress(null)
  }

  const handleOpenDialog = async (address?: UserAddressItem) => {
    if (address) {
      // Fetch full address details for editing
      const addressDetail = await fetchAddressById(address.id)
      if (!addressDetail) {
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin địa chỉ",
          variant: "destructive",
        })
        return
      }
      
      setEditingAddress(address)
      setFormData({
        addressType: addressDetail.addressType,
        fullName: addressDetail.fullName,
        address: addressDetail.address,
        city: addressDetail.city,
        state: addressDetail.state || "",
        postalCode: addressDetail.postalCode,
        country: addressDetail.country,
        isDefault: addressDetail.isDefault,
        phoneNumber: addressDetail.phoneNumber || "",
        status: addressDetail.status,
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let result
    if (editingAddress) {
      result = await updateAddress(editingAddress.id, formData)
    } else {
      result = await createAddress(formData)
    }

    if (result.success) {
      toast({
        title: "Thành công",
        description: editingAddress 
          ? "Đã cập nhật địa chỉ thành công" 
          : "Đã thêm địa chỉ mới thành công",
      })
      handleCloseDialog()
      await fetchAddresses({ isCurrentUser: true })
    } else {
      const errorMessage = result.errors && result.errors.length > 0
        ? result.errors.join(", ")
        : result.error || "Thao tác thất bại"
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (addressId: string) => {
    setDeletingAddressId(addressId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingAddressId) return

    const result = await deleteAddress(deletingAddressId)

    if (result.success) {
      toast({
        title: "Thành công",
        description: "Đã xóa địa chỉ thành công",
      })
      await fetchAddresses({ isCurrentUser: true })
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Xóa địa chỉ thất bại",
        variant: "destructive",
      })
    }

    setIsDeleteDialogOpen(false)
    setDeletingAddressId(null)
  }

  const getAddressTypeLabel = (type: AddressTypeEnum) => {
    switch (type) {
      case AddressTypeEnum.Home:
        return "Nhà riêng"
      case AddressTypeEnum.Office:
        return "Văn phòng"
      default:
        return "Khác"
    }
  }

  if (isLoading && addresses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Địa Chỉ Của Tôi</h3>
          <p className="text-sm text-muted-foreground">
            Quản lý địa chỉ giao hàng của bạn
          </p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-teal-700 hover:bg-teal-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm địa chỉ
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">Chưa có địa chỉ nào</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Thêm địa chỉ giao hàng để thuận tiện cho việc mua sắm
            </p>
            <Button 
              onClick={() => handleOpenDialog()}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm địa chỉ đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              <CardContent className="p-6">
                {address.isDefault && (
                  <Badge className="absolute top-4 right-4 bg-teal-700">
                    Mặc định
                  </Badge>
                )}
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{address.fullName}</h4>
                    {address.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {address.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {address.fullAddress}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(address)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Sửa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(address.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin địa chỉ giao hàng của bạn
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="0901234567"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Địa chỉ *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số nhà, tên đường"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Quận/Huyện *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Tỉnh/Thành phố</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Mã bưu điện *</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Quốc gia *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="addressType">Loại địa chỉ</Label>
                <Select
                  value={formData.addressType.toString()}
                  onValueChange={(value) => setFormData({ ...formData, addressType: parseInt(value) as AddressTypeEnum })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AddressTypeEnum.Home.toString()}>Nhà riêng</SelectItem>
                    <SelectItem value={AddressTypeEnum.Office.toString()}>Văn phòng</SelectItem>
                    <SelectItem value={AddressTypeEnum.Other.toString()}>Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isDefault" className="font-normal cursor-pointer">
                  Đặt làm địa chỉ mặc định
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Hủy
              </Button>
              <Button type="submit" className="bg-teal-700 hover:bg-teal-800" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  editingAddress ? "Cập nhật" : "Thêm địa chỉ"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa địa chỉ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

