import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { Checkbox } from "@/src/components/ui/checkbox"
import type { GHNProvince, GHNDistrict, GHNWard } from "@/src/entities/ghn/service/ghn-address-service"

interface GuestFormData {
  fullName: string
  address: string
  note: string
  phone: string
  email: string
}

interface GuestLocationState {
  provinceId: number
  provinceName: string
  districtId: number
  districtName: string
  wardCode: string
  wardName: string
  postalCode: string
}

interface CheckoutGuestSectionProps {
  formData: GuestFormData
  onFormDataChange: (field: keyof GuestFormData, value: string) => void
  guestLocation: GuestLocationState
  onProvinceChange: (value: string) => void
  onDistrictChange: (value: string) => void
  onWardChange: (value: string) => void
  onPostalCodeChange: (value: string) => void
  saveInfo: boolean
  onSaveInfoChange: (checked: boolean) => void
  provinceOptions: GHNProvince[]
  districtOptions: GHNDistrict[]
  wardOptions: GHNWard[]
  isProvinceLoading: boolean
  isDistrictLoading: boolean
  isWardLoading: boolean
  ensureProvincesLoaded: () => Promise<void>
  loadDistricts: (provinceId: number, resetFields?: boolean) => Promise<void>
  loadWards: (districtId: number, resetFields?: boolean) => Promise<void>
}

export function CheckoutGuestSection({
  formData,
  onFormDataChange,
  guestLocation,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  onPostalCodeChange,
  saveInfo,
  onSaveInfoChange,
  provinceOptions,
  districtOptions,
  wardOptions,
  isProvinceLoading,
  isDistrictLoading,
  isWardLoading,
  ensureProvincesLoaded,
  loadDistricts,
  loadWards,
}: CheckoutGuestSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và tên*</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => onFormDataChange("fullName", e.target.value)}
          required
          className="bg-muted/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Địa chỉ giao hàng*</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => onFormDataChange("address", e.target.value)}
          required
          className="bg-muted/50"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Tỉnh/Thành phố*</Label>
          <Select
            value={guestLocation.provinceId ? guestLocation.provinceId.toString() : ""}
            onValueChange={onProvinceChange}
            disabled={isProvinceLoading}
            onOpenChange={(open) => {
              if (open) {
                void ensureProvincesLoaded()
              }
            }}
          >
            <SelectTrigger className="bg-muted/50">
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
          <Label>Quận/Huyện*</Label>
          <Select
            value={guestLocation.districtId ? guestLocation.districtId.toString() : ""}
            onValueChange={onDistrictChange}
            disabled={isDistrictLoading || !guestLocation.provinceId}
            onOpenChange={(open) => {
              if (open && !districtOptions.length && guestLocation.provinceId) {
                void loadDistricts(guestLocation.provinceId, false)
              }
            }}
          >
            <SelectTrigger className="bg-muted/50">
              <SelectValue
                placeholder={
                  !guestLocation.provinceId
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

        <div className="space-y-2 md:col-span-2">
          <Label>Phường/Xã*</Label>
          <Select
            value={guestLocation.wardCode}
            onValueChange={onWardChange}
            disabled={isWardLoading || !guestLocation.districtId}
            onOpenChange={(open) => {
              if (open && !wardOptions.length && guestLocation.districtId) {
                void loadWards(guestLocation.districtId, false)
              }
            }}
          >
            <SelectTrigger className="bg-muted/50">
              <SelectValue
                placeholder={
                  !guestLocation.districtId
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
          <Label htmlFor="guestPostalCode">Mã bưu điện</Label>
          <Input
            id="guestPostalCode"
            value={guestLocation.postalCode}
            onChange={(e) => onPostalCodeChange(e.target.value)}
            className="bg-muted/50"
            placeholder="Ví dụ: 700000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại*</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onFormDataChange("phone", e.target.value)}
          required
          className="bg-muted/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email*</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFormDataChange("email", e.target.value)}
          required
          className="bg-muted/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guestNote">Ghi chú</Label>
        <Input
          id="guestNote"
          value={formData.note}
          onChange={(e) => onFormDataChange("note", e.target.value)}
          className="bg-muted/50"
          placeholder="Ghi chú cho đơn hàng (tùy chọn)"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="saveInfo"
          checked={saveInfo}
          onCheckedChange={(checked) => onSaveInfoChange(Boolean(checked))}
        />
        <Label htmlFor="saveInfo" className="cursor-pointer text-sm">
          Lưu thông tin cho lần thanh toán tiếp theo
        </Label>
      </div>
    </div>
  )
}

