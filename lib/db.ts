import { db } from './firebase';
import {
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    setDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { User, Quiz, Attempt, Question, Role } from '@/types';

export const db_helper = {
    // Users
    getUsers: async () => {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = querySnapshot.docs.map(doc => {
            return { id: doc.id, ...doc.data() } as User;
        });
        return users;
    },
    getUserById: async (id: string) => {
        const docSnap = await getDoc(doc(db, 'users', id));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as User;
        }
        return null;
    },
    findUserByEmail: async (email: string) => {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as User;
    },
    addUser: async (user: User) => {
        await setDoc(doc(db, 'users', user.id), user);
        return user;
    },
    verifyRole: async (userId: string, requiredRole: Role) => {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            return false;
        }
        const data = userDoc.data() as User;
        return data.role === requiredRole;
    },
    updateUserStatus: async (userId: string, status: 'active' | 'banned') => {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, { status }, { merge: true });
    },


    // Quizzes
    getQuizzes: async () => {
        const querySnapshot = await getDocs(collection(db, 'quizzes'));
        const quizzes = querySnapshot.docs.map(doc => {
            return { id: doc.id, ...doc.data() } as Quiz;
        });
        return quizzes;
    },
    addQuiz: async (quiz: Quiz) => {
        const { id, ...quizData } = quiz;
        if (id) {
            await setDoc(doc(db, 'quizzes', id), quizData);
            return quiz;
        } else {
            const docRef = await addDoc(collection(db, 'quizzes'), quizData);
            return { id: docRef.id, ...quizData } as Quiz;
        }
    },
    getQuizById: async (id: string) => {
        const docSnap = await getDoc(doc(db, 'quizzes', id));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Quiz;
        }
        return null;
    },

    // Attempts
    getAttempts: async () => {
        const querySnapshot = await getDocs(collection(db, 'attempts'));
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const userMap = new Map();
        usersSnapshot.forEach(doc => {
            userMap.set(doc.id, doc.data().name);
        });

        const attempts = querySnapshot.docs.map(doc => {
            const data = doc.data();
            let timestampString = data.timestamp;
            if (data.timestamp instanceof Timestamp) {
                timestampString = data.timestamp.toDate().toISOString();
            }
            return {
                id: doc.id,
                ...data,
                timestamp: timestampString,
                userName: userMap.get(data.userId) || 'Unknown User'
            } as any;
        });

        return attempts;
    },
    addAttempt: async (attempt: Attempt) => {
        const { id, ...attemptData } = attempt;
        const docRef = await addDoc(collection(db, 'attempts'), {
            ...attemptData,
            timestamp: serverTimestamp()
        });
        return { id: docRef.id, ...attemptData } as Attempt;
    },
    getAttemptsByUserId: async (userId: string) => {
        const q = query(
            collection(db, 'attempts'),
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);

        const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));
        const quizMap = new Map();
        quizzesSnapshot.forEach(doc => {
            quizMap.set(doc.id, doc.data().title);
        });

        const results = querySnapshot.docs.map(doc => {
            const data = doc.data();
            let timestampString = data.timestamp;
            if (data.timestamp instanceof Timestamp) {
                timestampString = data.timestamp.toDate().toISOString();
            }
            return {
                id: doc.id,
                ...data,
                timestamp: timestampString,
                quizTitle: quizMap.get(data.quizId) || 'Unknown'
            };
        });

        results.sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        return results;
    },
    checkExistingAttempt: async (userId: string, quizId: string) => {
        const q = query(
            collection(db, 'attempts'),
            where('userId', '==', userId),
            where('quizId', '==', quizId)
        );
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    },
    getAttemptsByQuizId: async (quizId: string) => {
        const q = query(
            collection(db, 'attempts'),
            where('quizId', '==', quizId)
        );
        const querySnapshot = await getDocs(q);

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const userMap = new Map();
        usersSnapshot.forEach(doc => {
            userMap.set(doc.id, doc.data().name);
        });

        const results = querySnapshot.docs.map(doc => {
            const data = doc.data();
            let timestampString = data.timestamp;
            if (data.timestamp instanceof Timestamp) {
                timestampString = data.timestamp.toDate().toISOString();
            }
            return {
                id: doc.id,
                ...data,
                userName: userMap.get(data.userId) || 'Unknown User',
                timestamp: timestampString
            };
        });

        results.sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        return results;
    },

    // Leaderboard
    getLeaderboard: async () => {
        const attemptsSnapshot = await getDocs(collection(db, 'attempts'));
        const usersSnapshot = await getDocs(collection(db, 'users'));

        const userMap = new Map();
        usersSnapshot.forEach(doc => {
            userMap.set(doc.id, doc.data().name);
        });

        const stats = new Map<string, { userId: string; userName: string; totalScore: number; gamesPlayed: number }>();

        attemptsSnapshot.forEach(doc => {
            const data = doc.data();
            const userId = data.userId;
            const userName = userMap.get(userId) || 'Unknown';

            const entry = stats.get(userId) || {
                userId,
                userName,
                totalScore: 0,
                gamesPlayed: 0
            };

            entry.totalScore += data.score;
            entry.gamesPlayed += 1;
            stats.set(userId, entry);
        });

        const leaderboard = Array.from(stats.values());
        leaderboard.sort((a, b) => {
            return b.totalScore - a.totalScore;
        });
        return leaderboard;
    },

    getQuizWinners: async () => {
        const attemptsSnapshot = await getDocs(collection(db, 'attempts'));
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));

        const userMap = new Map();
        usersSnapshot.forEach(doc => {
            userMap.set(doc.id, doc.data().name);
        });

        const quizMap = new Map();
        quizzesSnapshot.forEach(doc => {
            quizMap.set(doc.id, doc.data().title);
        });

        const quizWinners = new Map<string, { quizId: string; quizTitle: string; winnerName: string; score: number; totalQuestions: number }>();

        attemptsSnapshot.forEach(doc => {
            const data = doc.data();
            const quizId = data.quizId;
            const score = data.score;
            const totalQuestions = data.totalQuestions || 0;

            const currentWinner = quizWinners.get(quizId);
            // Higher score wins. If scores are equal, we could take the one with better time (if recorded) or just keep first.
            if (!currentWinner || score > currentWinner.score) {
                quizWinners.set(quizId, {
                    quizId,
                    quizTitle: quizMap.get(quizId) || 'Unknown Quiz',
                    winnerName: userMap.get(data.userId) || 'Unknown User',
                    score,
                    totalQuestions
                });
            }
        });

        return Array.from(quizWinners.values());
    }
};

export const db_instance = db_helper;
export { db_instance as db };
