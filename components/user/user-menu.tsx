"use client"

import { useState, type ComponentType } from "react"
import { toast } from "@/components/ui/toast"
import { motion, type Variants } from "motion/react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { LogOut, Loader2, Package, Search } from "lucide-react"
import { cn } from "@/lib/utils"

import EditableProfileName from "@/components/user/editable-profile-name"
import AvatarUploader from "@/components/user/avatar-uploader"
import { useLogout } from "@/hooks/use-logout"
import { User } from "@/types/user"

type Props = {
    user: User
    onNameChange: (name: string) => Promise<User | null>
    onAvatarChange: (file: File) => Promise<User | null>
    onLogout: () => Promise<void>
}

const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
}

const itemVariants: Variants = {
    // hidden: { opacity: 0, y: 6 },
    // visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
}

function MenuItem({
    icon: Icon,
    label,
    onClick,
    destructive,
    loading,
}: {
    icon: ComponentType<{ className?: string }>
    label: string
    onClick?: () => void
    destructive?: boolean
    loading?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors outline-none",
                "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60",
                destructive ? "text-destructive hover:bg-destructive/10" : "text-foreground"
            )}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
                <Icon className="h-4 w-4 shrink-0" />
            )}
            {label}
        </button>
    )
}

export default function UserProfileDialog({ user, onNameChange, onAvatarChange, onLogout }: Props) {
    const [currentUser, setCurrentUser] = useState<User>(user)
    const { logout, isLoggingOut } = useLogout(onLogout)
    const initials = (currentUser.full_name?.trim() || currentUser.phone).slice(0, 2)

    const handleNameChange = (name: string) => {
        return toast.promise(
            onNameChange(name).then((updatedUser) => {
                if (!updatedUser) {
                    throw new Error("User update failed")
                }
                setCurrentUser(updatedUser)
            }),
            {
                loading: "در حال تغییر نام...",
                success: "نام شما با موفقیت تغییر کرد",
                error: "تغییر نام انجام نشد. دوباره تلاش کنید.",
            }
        )
    }

    const handleAvatarChange = (file: File) => {
        return toast.promise(
            onAvatarChange(file).then((updatedUser) => {
                if (!updatedUser) {
                    throw new Error("User update failed")
                }
                setCurrentUser(updatedUser)
            }),
            {
                loading: "در حال آپلود تصویر...",
                success: "تصویر پروفایل تغییر کرد",
                error: "آپلود تصویر انجام نشد. دوباره تلاش کنید.",
            }
        )
    }

    return (
        <Dialog>
            <DialogTrigger>
                <div
                    className="relative m-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-shadow outline-none hover:ring-2 hover:ring-primary/40 hover:ring-offset-2 hover:ring-offset-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label="حساب کاربری"
                >
                    <Avatar className="h-9 w-9">
                        <AvatarImage
                            src={currentUser.avatar ?? undefined}
                            className="object-cover"
                        />
                        <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
                    </Avatar>
                </div>
            </DialogTrigger>

            <DialogContent dir="rtl" className="gap-0 overflow-hidden p-0 sm:max-w-sm">
                <DialogHeader className="sr-only">
                    <DialogTitle>حساب کاربری</DialogTitle>
                </DialogHeader>

                <motion.div initial="hidden" animate="visible" variants={listVariants}>
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col items-center gap-3 px-6 pt-8 pb-6"
                    >
                        <AvatarUploader
                            avatar={currentUser.avatar}
                            fallback={initials}
                            onChange={handleAvatarChange}
                        />

                        <div className="flex flex-col items-center gap-1">
                            <EditableProfileName
                                value={currentUser.full_name ?? ""}
                                onSave={handleNameChange}
                            />
                            <p
                                className="font-inter text-xs font-bold text-muted-foreground"
                                dir="ltr"
                            >
                                {currentUser.phone}
                            </p>
                        </div>
                    </motion.div>

                    <Separator />

                    <motion.nav variants={listVariants} className="flex flex-col gap-0.5 p-2">
                        <motion.div variants={itemVariants}>
                            <MenuItem icon={Package} label="لیست سفارشات" />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <MenuItem icon={Search} label="پیگیری سفارش" />
                        </motion.div>
                    </motion.nav>

                    <Separator />

                    <motion.div variants={itemVariants} className="p-2">
                        <MenuItem
                            icon={LogOut}
                            label="خروج از حساب"
                            destructive
                            loading={isLoggingOut}
                            onClick={logout}
                        />
                    </motion.div>
                </motion.div>
            </DialogContent>
        </Dialog>
    )
}
