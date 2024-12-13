import {User} from "@/lib/models";

interface UserCardProps {
    user: User
}

export default function UserCard(props: UserCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col items-center p-4">
                {/* Avatar or Profile Image */}
                <div className="w-24 h-24 bg-gray-300 rounded-full mb-4"></div>

                {/* User Name */}
                <p className="text-xl font-semibold text-black">
                    {props.user.name} {props.user.surname}
                </p>
                <p className="text-sm text-gray-600">{props.user.patronymic}</p>
            </div>

            {/* Email */}
            <div className="bg-gray-100 p-2 text-center">
                <p className="text-sm text-gray-700">{props.user.email}</p>
            </div>

            {/* Role and Status */}
            <div className="flex justify-between p-2 bg-white text-center">
                <p className="text-sm font-bold text-black">{props.user.role}</p>

                {/* Verification and Blocked Status */}
                <div className="flex space-x-2">
                    <span
                        className={`text-sm px-2 py-1 rounded-full ${props.user.isVerified ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                    >
                        {props.user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                    <span
                        className={`text-sm px-2 py-1 rounded-full ${props.user.isBlocked ? 'bg-gray-500 text-white' : 'bg-blue-500 text-white'}`}
                    >
                        {props.user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                </div>
            </div>
        </div>
    );
}