import React, { useEffect, useState } from 'react';
import { UserApi } from '../../services/api/user.api';
import { useNavigate } from 'react-router-dom';
import { IoAdd, IoSearchOutline, IoMailOutline, IoCallOutline, IoGridOutline, IoListOutline } from 'react-icons/io5';
import { Table } from '../../components/Table/Table';
import { FaEdit } from 'react-icons/fa';

const TeamList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await UserApi.users();
            console.log(res);
            setUsers(res.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u => 
        (u.firstName + ' ' + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const columnDefs = [
        { headerName: "First Name", field: "firstName" },
        { headerName: "Last Name", field: "lastName" },
        { headerName: "Email", field: "email" },
        { 
            headerName: "Role", 
            field: "userRole.name",
            valueGetter: (params) => {
                 const role = params.data.userRole;
                 if (role && role.name) return role.name;
                 if (params.data.userRoles && params.data.userRoles.length > 0) return params.data.userRoles.map(r => r.name).join(", ");
                 return typeof role === 'string' ? 'Role ID: ' + role.substring(0,5) : 'Member';
            }
        },
        { 
            headerName: "Actions", 
            field: "actions",
            cellRenderer: (params) => (
                <button onClick={() => navigate('/user/create', { state: { user: params.data } })} className="text-blue-500 hover:text-blue-700">
                    <FaEdit />
                </button>
            )
        },
    ];

    // NOTE: CreateUser needs to handle location state if passed like above, or we stick to Modal logic?
    // CreateUser uses a Modal internally but is also a page? 
    // Actually in the App.jsx routes: <Route path="create" element={<ProtectedRoute element={<CreateUser />} />} />
    // So distinct page. The modal logic inside CreateUser might be for when it's used as a component elsewhere or just legacy.
    // Let's assume navigating to /user/create is correct for "Add Member". 
    // Editing might need a different route or params. 
    // Just View for now.

    return (
        <div className="p-6 bg-bgLight min-h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-textMain">Team Members</h1>
                    <p className="text-textSub text-sm mt-1">Manage your team and their roles</p>
                </div>
                <div className="flex items-center gap-3">
                     <div className="flex bg-white p-1 rounded-lg border border-borderLight mr-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-textSub hover:text-textMain'}`}
                            title="Grid View"
                        >
                            <IoGridOutline />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-primary/10 text-primary' : 'text-textSub hover:text-textMain'}`}
                            title="List View"
                        >
                            <IoListOutline />
                        </button>
                     </div>

                     {viewMode === 'grid' && (
                        <div className="relative">
                            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-textSub" />
                            <input 
                                type="text" 
                                placeholder="Search members..." 
                                className="pl-10 pr-4 py-2 rounded-xl border border-borderLight focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm w-64"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                     )}

                     <button 
                        onClick={() => navigate('/user/create')}
                        className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-primary/30 flex items-center gap-2 transition-transform active:scale-95"
                     >
                        <IoAdd size={18} />
                        <span>Add Member</span>
                     </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1">
                {viewMode === 'table' ? (
                    <div className="bg-surface rounded-2xl shadow-sm border border-borderLight overflow-hidden h-[calc(100vh-200px)]">
                         <Table
                            column={columnDefs}
                            getTableFunction={UserApi.users}
                            searchLabel={"Member"}
                            totalCount={true}
                        />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-surface h-48 rounded-2xl shadow-sm border border-borderLight animate-pulse"></div>
                                ))
                            ) : currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <div 
                                        key={user._id} 
                                        className="bg-surface rounded-[2rem] p-6 shadow-sm border border-borderLight hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all group flex flex-col items-center text-center relative"
                                    >
                                         <div className="relative mb-4">
                                             <img 
                                                 src={user.profileImage || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=4f46e5&color=fff`} 
                                                 alt={user.firstName} 
                                                 className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white shadow-md transition-transform group-hover:scale-105"
                                             />
                                             <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-primary">
                                                 <IoAdd size={14} className="rotate-45" />
                                             </div>
                                         </div>

                                         <h3 className="text-base font-black text-slate-800 mb-1 group-hover:text-primary transition-colors">{user.firstName} {user.lastName}</h3>
                                         <span className="bg-primary/5 text-primary border border-primary/10 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
                                             {user.userRole?.name || (typeof user.userRole === 'string' ? 'Role ID: ' + user.userRole.substring(0,5) : 'Member')}
                                         </span>

                                         <div className="w-full space-y-2.5 pt-5 border-t border-slate-50 mt-auto">
                                             <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                                                 <IoMailOutline className="text-primary/40 group-hover:text-primary transition-colors" size={14} />
                                                 <span className="truncate max-w-[150px]">{user.email}</span>
                                             </div>
                                             <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                                                 <IoCallOutline className="text-primary/40 group-hover:text-primary transition-colors" size={14} />
                                                 <span>{user.mobile || user.phoneNumber || 'NO CONTACT'}</span>
                                             </div>
                                         </div>

                                         <button 
                                            onClick={() => navigate('/user/create', { state: { user } })}
                                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                         >
                                            <FaEdit size={14} />
                                         </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 text-textSub">
                                    <p>No team members found.</p>
                                </div>
                            )}
                        </div>
                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-2">
                                <button 
                                    onClick={() => paginate(currentPage - 1)} 
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 bg-white border border-borderLight rounded-lg text-sm text-textSub disabled:opacity-50 hover:bg-slate-50 disabled:hover:bg-white transition-colors"
                                >
                                    Previous
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => paginate(i + 1)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                            currentPage === i + 1 
                                                ? 'bg-primary text-white shadow-sm' 
                                                : 'bg-white border border-borderLight text-textSub hover:bg-slate-50'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => paginate(currentPage + 1)} 
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 bg-white border border-borderLight rounded-lg text-sm text-textSub disabled:opacity-50 hover:bg-slate-50 disabled:hover:bg-white transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TeamList;
