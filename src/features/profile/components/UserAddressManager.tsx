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
import { ghnAddressService, type GHNProvince, type GHNDistrict, type GHNWard } from "@/src/entities/ghn/service/ghn-address-service"
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
import { Pagination } from "@/src/components/ui/pagination"

type UserAddressManagerProps = {
  selectable?: boolean
  selectedAddressId?: string | null
  onSelectAddress?: (address: UserAddressItem) => void
  hideHeader?: boolean
}

export function UserAddressManager({
  selectable = false,
  selectedAddressId,
  onSelectAddress,
  hideHeader = false,
}: UserAddressManagerProps) {
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
  const { totalItems, pageSize: storePageSize } = useUserAddressStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddressItem | null>(null)
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null)
  
  const initialFormData: UserAddressRequest = {
    addressType: AddressTypeEnum.Home,
    fullName: "",
    address: "",
    provinceId: 0,
    provinceName: "",
    districtId: 0,
    districtName: "",
    wardCode: "",
    wardName: "",
    postalCode: "",
    isDefault: false,
    phoneNumber: "",
    status: EntityStatusEnum.Active,
  }

  const [formData, setFormData] = useState<UserAddressRequest>(initialFormData)
  const [provinceOptions, setProvinceOptions] = useState<GHNProvince[]>([])
  const [districtOptions, setDistrictOptions] = useState<GHNDistrict[]>([])
  const [wardOptions, setWardOptions] = useState<GHNWard[]>([])
  const [hasLoadedProvinces, setHasLoadedProvinces] = useState(false)
  const [isProvinceLoading, setIsProvinceLoading] = useState(false)
  const [isDistrictLoading, setIsDistrictLoading] = useState(false)
  const [isWardLoading, setIsWardLoading] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = storePageSize || 6

  useEffect(() => {
    fetchAddresses({ isCurrentUser: true, page: currentPage, pageSize })
  }, [fetchAddresses, currentPage])

  const loadProvinces = async () => {
    if (hasLoadedProvinces) return
    try {
      setIsProvinceLoading(true)
      const provinces = await ghnAddressService.getProvinces()
      setProvinceOptions(provinces)
      setHasLoadedProvinces(true)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tải danh sách tỉnh/thành",
        variant: "destructive",
      })
    } finally {
      setIsProvinceLoading(false)
    }
  }

  const loadDistricts = async (provinceId: number, resetFields = true) => {
    if (!provinceId) {
      setDistrictOptions([])
      setWardOptions([])
      return
    }

    try {
      setIsDistrictLoading(true)
      const districts = await ghnAddressService.getDistricts(provinceId)
      setDistrictOptions(districts)
      if (resetFields) {
        setFormData((prev) => ({
          ...prev,
          districtId: 0,
          districtName: "",
          wardCode: "",
          wardName: "",
        }))
      }
      setWardOptions([])
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tải danh sách quận/huyện",
        variant: "destructive",
      })
    } finally {
      setIsDistrictLoading(false)
    }
  }

  const loadWards = async (districtId: number, resetFields = true) => {
    if (!districtId) {
      setWardOptions([])
      return
    }

    try {
      setIsWardLoading(true)
      const wards = await ghnAddressService.getWards(districtId)
      setWardOptions(wards)
      if (resetFields) {
        setFormData((prev) => ({
          ...prev,
          wardCode: "",
          wardName: "",
        }))
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tải danh sách phường/xã",
        variant: "destructive",
      })
    } finally {
      setIsWardLoading(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setDistrictOptions([])
    setWardOptions([])
    setEditingAddress(null)
  }

  const handleProvinceChange = async (provinceIdString: string) => {
    const provinceId = Number(provinceIdString)
    const selected = provinceOptions.find((p) => p.ProvinceID === provinceId)
    setFormData((prev) => ({
      ...prev,
      provinceId,
      provinceName: selected?.ProvinceName ?? "",
      districtId: 0,
      districtName: "",
      wardCode: "",
      wardName: "",
    }))
    await loadDistricts(provinceId)
  }

  const handleDistrictChange = async (districtIdString: string) => {
    const districtId = Number(districtIdString)
    const selected = districtOptions.find((d) => d.DistrictID === districtId)
    setFormData((prev) => ({
      ...prev,
      districtId,
      districtName: selected?.DistrictName ?? "",
      wardCode: "",
      wardName: "",
    }))
    await loadWards(districtId)
  }

  const handleWardChange = (wardCode: string) => {
    const selected = wardOptions.find((w) => w.WardCode === wardCode)
    setFormData((prev) => ({
      ...prev,
      wardCode,
      wardName: selected?.WardName ?? "",
    }))
  }

  const ensureProvincesLoaded = async () => {
    if (!hasLoadedProvinces) {
      await loadProvinces()
    }
  }

  const handleOpenDialog = async (address?: UserAddressItem) => {
    await ensureProvincesLoaded()

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
        provinceId: addressDetail.provinceId ?? 0,
        provinceName: addressDetail.provinceName ?? "",
        districtId: addressDetail.districtId ?? 0,
        districtName: addressDetail.districtName ?? "",
        wardCode: addressDetail.wardCode ?? "",
        wardName: addressDetail.wardName ?? "",
        postalCode: addressDetail.postalCode ?? "",
        isDefault: addressDetail.isDefault,
        phoneNumber: addressDetail.phoneNumber || "",
        status: addressDetail.status,
      })

      if (addressDetail.provinceId) {
        await loadDistricts(addressDetail.provinceId, false)
      }
      if (addressDetail.districtId) {
        await loadWards(addressDetail.districtId, false)
      }
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const validateLocationSelection = () => {
    if (!formData.provinceId || !formData.provinceName) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn Tỉnh/Thành phố",
        variant: "destructive",
      })
      return false
    }
    if (!formData.districtId || !formData.districtName) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn Quận/Huyện",
        variant: "destructive",
      })
      return false
    }
    if (!formData.wardCode || !formData.wardName) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn Phường/Xã",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateLocationSelection()) {
      return
    }

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
      <div className="flex items-center justify-between gap-4">
        {!hideHeader && (
          <div>
            <h3 className="text-lg font-semibold">Địa Chỉ Của Tôi</h3>
            <p className="text-sm text-muted-foreground">
              Quản lý địa chỉ giao hàng của bạn
            </p>
          </div>
        )}
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-teal-700 hover:bg-teal-800 whitespace-nowrap"
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
        <>
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => {
            const isSelected = selectable && selectedAddressId === address.id
            const handleSelectAddress = () => {
              if (selectable && onSelectAddress) {
                onSelectAddress(address)
              }
            }

            return (
              <Card
                key={address.id}
                className={`relative transition-all ${
                  isSelected ? "border-primary ring-2 ring-primary/30" : ""
                }`}
                onClick={handleSelectAddress}
              >
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
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenDialog(address)
                      }}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(address.id)
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Xóa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        {/* Pagination */}
        <div className="flex justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil((totalItems || addresses.length) / pageSize))}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
        </>
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
                <Label>Tỉnh/Thành phố *</Label>
                <Select
                  value={formData.provinceId ? formData.provinceId.toString() : ""}
                  onValueChange={handleProvinceChange}
                  disabled={isProvinceLoading}
                onOpenChange={(open) => {
                  if (open) {
                    void ensureProvincesLoaded()
                  }
                }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isProvinceLoading ? "Đang tải..." : "Chọn tỉnh/thành"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {provinceOptions.map((province) => (
                      <SelectItem key={province.ProvinceID} value={province.ProvinceID.toString()}>
                        {province.ProvinceName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quận/Huyện *</Label>
                <Select
                  value={formData.districtId ? formData.districtId.toString() : ""}
                  onValueChange={handleDistrictChange}
                  disabled={isDistrictLoading || !formData.provinceId}
                onOpenChange={(open) => {
                  if (open && !districtOptions.length && formData.provinceId) {
                    void loadDistricts(formData.provinceId, false)
                  }
                }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !formData.provinceId
                          ? "Chọn tỉnh trước"
                          : isDistrictLoading
                          ? "Đang tải..."
                          : "Chọn quận/huyện"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {districtOptions.map((district) => (
                      <SelectItem key={district.DistrictID} value={district.DistrictID.toString()}>
                        {district.DistrictName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Phường/Xã *</Label>
                <Select
                  value={formData.wardCode}
                  onValueChange={handleWardChange}
                  disabled={isWardLoading || !formData.districtId}
                onOpenChange={(open) => {
                  if (open && !wardOptions.length && formData.districtId) {
                    void loadWards(formData.districtId, false)
                  }
                }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !formData.districtId
                          ? "Chọn quận/huyện trước"
                          : isWardLoading
                          ? "Đang tải..."
                          : "Chọn phường/xã"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {wardOptions.map((ward) => (
                      <SelectItem key={ward.WardCode} value={ward.WardCode}>
                        {ward.WardName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Mã bưu điện</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode ?? ""}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="Ví dụ: 700000"
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

