<?php

namespace App\Repository;

use App\Entity\Tasks;
use App\Entity\Users;
use App\Entity\UsersTasks;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UsersTasks>
 */
class UsersTasksRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UsersTasks::class);
    }

    /**
     * @return Tasks[] Returns an array of Tasks objects for a given user
     */
    public function findTasksByUser(Users $user): array
    {
        $usersTasks = $this->createQueryBuilder('ut')
            ->innerJoin('ut.tasks', 't')
            ->addSelect('t')
            ->where('ut.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult()
        ;
        
        $tasks = [];
        foreach ($usersTasks as $userTask) {
            if ($userTask instanceof UsersTasks) {
                $task = $userTask->getTasks();
                if ($task) {
                    $tasks[] = $task;
                }
            }
        }
        
        return $tasks;
    }

    //    /**
    //     * @return UsersTasks[] Returns an array of UsersTasks objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('u.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?UsersTasks
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
